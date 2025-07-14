// Offline management and caching utilities
export interface CacheConfig {
  name: string
  version: string
  maxAge: number
  maxSize: number
}

export interface OfflineData {
  id: string
  type: 'summary' | 'voice' | 'user_data'
  data: any
  timestamp: number
  synced: boolean
}

export interface SyncQueueItem {
  id: string
  action: 'create' | 'update' | 'delete'
  endpoint: string
  data: any
  timestamp: number
  retries: number
}

class OfflineManager {
  private dbName = 'ytsbyai-offline'
  private dbVersion = 1
  private cacheConfigs: Map<string, CacheConfig> = new Map()
  private syncQueue: SyncQueueItem[] = []
  private isOnline = navigator.onLine

  constructor() {
    this.init()
    this.setupEventListeners()
  }

  private async init() {
    await this.initIndexedDB()
    await this.loadSyncQueue()
    this.startSyncInterval()
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.processSyncQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  // IndexedDB setup
  private async initIndexedDB() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains('offline_data')) {
          const offlineStore = db.createObjectStore('offline_data', { keyPath: 'id' })
          offlineStore.createIndex('type', 'type', { unique: false })
          offlineStore.createIndex('timestamp', 'timestamp', { unique: false })
          offlineStore.createIndex('synced', 'synced', { unique: false })
        }

        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' })
          syncStore.createIndex('timestamp', 'timestamp', { unique: false })
          syncStore.createIndex('retries', 'retries', { unique: false })
        }

        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' })
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  // Cache management
  public async setCacheConfig(name: string, config: CacheConfig) {
    this.cacheConfigs.set(name, config)
  }

  public async cacheData(key: string, data: any, cacheName: string = 'default') {
    const config = this.cacheConfigs.get(cacheName) || {
      name: cacheName,
      version: '1.0',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      maxSize: 50 * 1024 * 1024, // 50MB
    }

    const cacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      version: config.version,
    }

    try {
      const db = await this.getDB()
      const transaction = db.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')

      // Check cache size and clean old entries if needed
      await this.cleanCache(store, config)

      await this.promisifyRequest(store.put(cacheEntry))
    } catch (error) {
      console.error('Cache write failed:', error)
    }
  }

  public async getCachedData(key: string, cacheName: string = 'default'): Promise<any> {
    try {
      const db = await this.getDB()
      const transaction = db.transaction(['cache'], 'readonly')
      const store = transaction.objectStore('cache')
      
      const result = await this.promisifyRequest(store.get(key))
      
      if (result && this.isCacheValid(result, cacheName)) {
        return result.data
      }
      
      return null
    } catch (error) {
      console.error('Cache read failed:', error)
      return null
    }
  }

  private isCacheValid(entry: any, cacheName: string): boolean {
    const config = this.cacheConfigs.get(cacheName)
    if (!config) return true

    const age = Date.now() - entry.timestamp
    return age < config.maxAge && entry.version === config.version
  }

  private async cleanCache(store: IDBObjectStore, config: CacheConfig) {
    const request = store.index('timestamp').openCursor()
    
    return new Promise<void>((resolve) => {
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          const entry = cursor.value
          const age = Date.now() - entry.timestamp
          
          if (age > config.maxAge) {
            cursor.delete()
          }
          cursor.continue()
        } else {
          resolve()
        }
      }
    })
  }

  // Offline data storage
  public async storeOfflineData(data: Omit<OfflineData, 'id' | 'timestamp'>): Promise<string> {
    const id = this.generateId()
    const offlineData: OfflineData = {
      ...data,
      id,
      timestamp: Date.now(),
    }

    try {
      const db = await this.getDB()
      const transaction = db.transaction(['offline_data'], 'readwrite')
      const store = transaction.objectStore('offline_data')
      
      await this.promisifyRequest(store.put(offlineData))
      return id
    } catch (error) {
      console.error('Offline data storage failed:', error)
      throw error
    }
  }

  public async getOfflineData(type?: string): Promise<OfflineData[]> {
    try {
      const db = await this.getDB()
      const transaction = db.transaction(['offline_data'], 'readonly')
      const store = transaction.objectStore('offline_data')
      
      let request: IDBRequest
      if (type) {
        request = store.index('type').getAll(type)
      } else {
        request = store.getAll()
      }
      
      return await this.promisifyRequest(request)
    } catch (error) {
      console.error('Offline data retrieval failed:', error)
      return []
    }
  }

  public async markAsSynced(id: string): Promise<void> {
    try {
      const db = await this.getDB()
      const transaction = db.transaction(['offline_data'], 'readwrite')
      const store = transaction.objectStore('offline_data')
      
      const data = await this.promisifyRequest(store.get(id))
      if (data) {
        data.synced = true
        await this.promisifyRequest(store.put(data))
      }
    } catch (error) {
      console.error('Mark as synced failed:', error)
    }
  }

  // Sync queue management
  public async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>): Promise<string> {
    const id = this.generateId()
    const queueItem: SyncQueueItem = {
      ...item,
      id,
      timestamp: Date.now(),
      retries: 0,
    }

    this.syncQueue.push(queueItem)
    await this.saveSyncQueue()
    
    if (this.isOnline) {
      this.processSyncQueue()
    }

    return id
  }

  private async loadSyncQueue() {
    try {
      const db = await this.getDB()
      const transaction = db.transaction(['sync_queue'], 'readonly')
      const store = transaction.objectStore('sync_queue')
      
      this.syncQueue = await this.promisifyRequest(store.getAll())
    } catch (error) {
      console.error('Sync queue load failed:', error)
      this.syncQueue = []
    }
  }

  private async saveSyncQueue() {
    try {
      const db = await this.getDB()
      const transaction = db.transaction(['sync_queue'], 'readwrite')
      const store = transaction.objectStore('sync_queue')
      
      // Clear existing queue
      await this.promisifyRequest(store.clear())
      
      // Add all items
      for (const item of this.syncQueue) {
        await this.promisifyRequest(store.put(item))
      }
    } catch (error) {
      console.error('Sync queue save failed:', error)
    }
  }

  private async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) return

    const itemsToProcess = [...this.syncQueue]
    this.syncQueue = []

    for (const item of itemsToProcess) {
      try {
        await this.processSyncItem(item)
      } catch (error) {
        console.error('Sync item processing failed:', error)
        
        // Retry logic
        if (item.retries < 3) {
          item.retries++
          item.timestamp = Date.now()
          this.syncQueue.push(item)
        }
      }
    }

    await this.saveSyncQueue()
  }

  private async processSyncItem(item: SyncQueueItem): Promise<void> {
    const { endpoint, action, data } = item

    const response = await fetch(endpoint, {
      method: action === 'delete' ? 'DELETE' : action === 'update' ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: action !== 'delete' ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`)
    }
  }

  private startSyncInterval() {
    setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.processSyncQueue()
      }
    }, 30000) // Check every 30 seconds
  }

  // Utility methods
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  private promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Public API
  public isOnlineStatus(): boolean {
    return this.isOnline
  }

  public getSyncQueueLength(): number {
    return this.syncQueue.length
  }

  public async clearCache(cacheName?: string): Promise<void> {
    try {
      const db = await this.getDB()
      const transaction = db.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      
      if (cacheName) {
        // Clear specific cache
        const request = store.index('timestamp').openCursor()
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result
          if (cursor) {
            const entry = cursor.value
            if (entry.cacheName === cacheName) {
              cursor.delete()
            }
            cursor.continue()
          }
        }
      } else {
        // Clear all cache
        await this.promisifyRequest(store.clear())
      }
    } catch (error) {
      console.error('Cache clear failed:', error)
    }
  }

  public async getOfflineStats() {
    try {
      const db = await this.getDB()
      const transaction = db.transaction(['offline_data', 'sync_queue'], 'readonly')
      
      const offlineStore = transaction.objectStore('offline_data')
      const syncStore = transaction.objectStore('sync_queue')
      
      const offlineData = await this.promisifyRequest(offlineStore.getAll())
      const syncQueue = await this.promisifyRequest(syncStore.getAll())
      
      return {
        offlineDataCount: offlineData.length,
        unsyncedDataCount: offlineData.filter(d => !d.synced).length,
        syncQueueLength: syncQueue.length,
        isOnline: this.isOnline,
      }
    } catch (error) {
      console.error('Stats retrieval failed:', error)
      return {
        offlineDataCount: 0,
        unsyncedDataCount: 0,
        syncQueueLength: 0,
        isOnline: this.isOnline,
      }
    }
  }
}

// Singleton instance
export const offlineManager = new OfflineManager()

// React hook for offline functionality
export const useOfflineManager = () => {
  const [isOnline, setIsOnline] = React.useState(offlineManager.isOnlineStatus())
  const [syncQueueLength, setSyncQueueLength] = React.useState(offlineManager.getSyncQueueLength())

  React.useEffect(() => {
    const updateStatus = () => {
      setIsOnline(offlineManager.isOnlineStatus())
      setSyncQueueLength(offlineManager.getSyncQueueLength())
    }

    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  }, [])

  return {
    isOnline,
    syncQueueLength,
    cacheData: offlineManager.cacheData.bind(offlineManager),
    getCachedData: offlineManager.getCachedData.bind(offlineManager),
    storeOfflineData: offlineManager.storeOfflineData.bind(offlineManager),
    getOfflineData: offlineManager.getOfflineData.bind(offlineManager),
    addToSyncQueue: offlineManager.addToSyncQueue.bind(offlineManager),
    getOfflineStats: offlineManager.getOfflineStats.bind(offlineManager),
    clearCache: offlineManager.clearCache.bind(offlineManager),
  }
}

// Utility functions
export const cacheAPIResponse = async (key: string, response: Response, cacheName: string = 'api') => {
  const data = await response.clone().json()
  await offlineManager.cacheData(key, data, cacheName)
  return response
}

export const getCachedAPIResponse = async (key: string, cacheName: string = 'api') => {
  return await offlineManager.getCachedData(key, cacheName)
}

export const storeOfflineSummary = async (summaryData: any) => {
  return await offlineManager.storeOfflineData({
    type: 'summary',
    data: summaryData,
    synced: false,
  })
}

export const storeOfflineVoice = async (voiceData: any) => {
  return await offlineManager.storeOfflineData({
    type: 'voice',
    data: voiceData,
    synced: false,
  })
} 