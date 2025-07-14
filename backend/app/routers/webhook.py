from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
import stripe
from app.core.config import settings
from app.core.firebase import update_user_subscription, get_user_record
import json

router = APIRouter()

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    
    # Get the webhook payload
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event["type"] == "checkout.session.completed":
        await handle_checkout_completed(event["data"]["object"])
    elif event["type"] == "customer.subscription.created":
        await handle_subscription_created(event["data"]["object"])
    elif event["type"] == "customer.subscription.updated":
        await handle_subscription_updated(event["data"]["object"])
    elif event["type"] == "customer.subscription.deleted":
        await handle_subscription_deleted(event["data"]["object"])
    elif event["type"] == "invoice.payment_succeeded":
        await handle_payment_succeeded(event["data"]["object"])
    elif event["type"] == "invoice.payment_failed":
        await handle_payment_failed(event["data"]["object"])
    else:
        print(f"Unhandled event type: {event['type']}")
    
    return JSONResponse(content={"status": "success"})

async def handle_checkout_completed(session):
    """Handle successful checkout completion"""
    firebase_uid = session.get("metadata", {}).get("firebase_uid")
    if firebase_uid:
        await update_user_subscription(firebase_uid, {
            "status": "active",
            "customer_id": session.get("customer"),
            "subscription_id": session.get("subscription")
        })

async def handle_subscription_created(subscription):
    """Handle subscription creation"""
    customer_id = subscription.get("customer")
    if customer_id:
        # Find user by customer ID and update
        # This would require a reverse lookup in Firestore
        pass

async def handle_subscription_updated(subscription):
    """Handle subscription updates"""
    customer_id = subscription.get("customer")
    status = subscription.get("status")
    
    if customer_id and status:
        # Update user subscription status
        # This would require a reverse lookup in Firestore
        pass

async def handle_subscription_deleted(subscription):
    """Handle subscription deletion"""
    customer_id = subscription.get("customer")
    if customer_id:
        # Find user and mark subscription as canceled
        # This would require a reverse lookup in Firestore
        pass

async def handle_payment_succeeded(invoice):
    """Handle successful payment"""
    customer_id = invoice.get("customer")
    if customer_id:
        # Update user subscription status to active
        # This would require a reverse lookup in Firestore
        pass

async def handle_payment_failed(invoice):
    """Handle failed payment"""
    customer_id = invoice.get("customer")
    if customer_id:
        # Update user subscription status to past_due
        # This would require a reverse lookup in Firestore
        pass

# Helper function to find user by Stripe customer ID
async def find_user_by_customer_id(customer_id: str):
    """Find user record by Stripe customer ID"""
    # This would require a Firestore query
    # For now, we'll need to implement this based on your data structure
    pass 