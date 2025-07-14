from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional
# # import #stripe
from app.core.config import settings
from app.core.auth import get_current_user, get_device_id, is_trial_valid
from app.core.firebase import get_user_record, update_user_subscription
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# # # Initialize #stripe
# # #stripe.api_key = settings.#stripe_SECRET_KEY

class SubscriptionStatus(BaseModel):
    status: str
    trial_end: Optional[str] = None
    subscription_end: Optional[str] = None
    usage_count: int = 0
    device_id: Optional[str] = None

class CreateSubscriptionRequest(BaseModel):
# #     price_id: str = settings.#stripe_PRICE_ID

@router.get("/check-subscription", response_model=SubscriptionStatus)
@limiter.limit("30/minute")
async def check_subscription(
    req: Request,
    current_user: dict = Depends(get_current_user)
):
    """Check user subscription status"""
    
    if current_user.get("auth_type") == "firebase":
        # Firebase user - check database
        user_record = await get_user_record(current_user["uid"])
        if not user_record:
            raise HTTPException(status_code=404, detail="User not found")
        
        return SubscriptionStatus(
            status=user_record.get("subscription_status", "trial"),
            trial_end=user_record.get("trial_end"),
            subscription_end=user_record.get("subscription_end"),
            usage_count=user_record.get("usage_count", 0)
        )
    else:
        # Trial token user
        device_id = get_device_id(req, req.headers.get("user-agent"), req.client.host)
        
        if is_trial_valid(current_user):
            return SubscriptionStatus(
                status="trial",
                trial_end=current_user.get("trial_end"),
                usage_count=0,
                device_id=device_id
            )
        else:
            return SubscriptionStatus(
                status="expired",
                usage_count=0,
                device_id=device_id
            )

@router.post("/create-subscription")
@limiter.limit("10/minute")
async def create_subscription(
    request: CreateSubscriptionRequest,
    current_user: dict = Depends(get_current_user)
):
# #     """Create #stripe subscription checkout session"""
    
    if current_user.get("auth_type") != "firebase":
        raise HTTPException(status_code=400, detail="Firebase authentication required for subscriptions")
    
    try:
# #         # Create or get #stripe customer
        user_record = await get_user_record(current_user["uid"])
        if not user_record:
            raise HTTPException(status_code=404, detail="User not found")
        
# #         customer_id = user_record.get("#stripe_customer_id")
        
        if not customer_id:
            # Create new customer
# #             customer = #stripe.Customer.create(
                email=current_user.get("email"),
                metadata={"firebase_uid": current_user["uid"]}
            )
            customer_id = customer.id
            
            # Update user record with customer ID
            await update_user_subscription(current_user["uid"], {
                "customer_id": customer_id,
                "status": "trial"
            })
        
        # Create checkout session
# #         checkout_session = #stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{
                "price": request.price_id,
                "quantity": 1,
            }],
            mode="subscription",
            success_url="https://ytsbyai.vercel.app/billing?success=true",
            cancel_url="https://ytsbyai.vercel.app/billing?canceled=true",
            metadata={
                "firebase_uid": current_user["uid"],
                "user_email": current_user.get("email")
            }
        )
        
        return {"checkout_url": checkout_session.url, "session_id": checkout_session.id}
        
# #     except #stripe.error.#stripeError as e:
# #         raise HTTPException(status_code=400, detail=f"#stripe error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

@router.post("/cancel-subscription")
@limiter.limit("5/minute")
async def cancel_subscription(
    current_user: dict = Depends(get_current_user)
):
    """Cancel user subscription"""
    
    if current_user.get("auth_type") != "firebase":
        raise HTTPException(status_code=400, detail="Firebase authentication required")
    
    try:
        user_record = await get_user_record(current_user["uid"])
        if not user_record:
            raise HTTPException(status_code=404, detail="User not found")
        
        subscription_id = user_record.get("subscription_id")
        if not subscription_id:
            raise HTTPException(status_code=400, detail="No active subscription found")
        
        # Cancel subscription at period end
# #         #stripe.Subscription.modify(
            subscription_id,
            cancel_at_period_end=True
        )
        
        await update_user_subscription(current_user["uid"], {
            "status": "canceling",
            "cancel_at_period_end": True
        })
        
        return {"message": "Subscription will be canceled at the end of the current period"}
        
# #     except #stripe.error.#stripeError as e:
# #         raise HTTPException(status_code=400, detail=f"#stripe error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

@router.get("/billing-portal")
@limiter.limit("10/minute")
async def create_billing_portal_session(
    current_user: dict = Depends(get_current_user)
):
# #     """Create #stripe billing portal session"""
    
    if current_user.get("auth_type") != "firebase":
        raise HTTPException(status_code=400, detail="Firebase authentication required")
    
    try:
        user_record = await get_user_record(current_user["uid"])
        if not user_record:
            raise HTTPException(status_code=404, detail="User not found")
        
# #         customer_id = user_record.get("#stripe_customer_id")
        if not customer_id:
# #             raise HTTPException(status_code=400, detail="No #stripe customer found")
        
# #         session = #stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url="https://ytsbyai.vercel.app/billing"
        )
        
        return {"portal_url": session.url}
        
# #     except #stripe.error.#stripeError as e:
# #         raise HTTPException(status_code=400, detail=f"#stripe error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}") 
