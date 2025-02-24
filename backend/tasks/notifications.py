import aioredis
import asyncio
from fastapi import APIRouter, WebSocket
import json
from contextlib import asynccontextmanager

router = APIRouter()

@asynccontextmanager
async def get_redis():
    redis = aioredis.from_url("redis://localhost")
    try:
        yield redis
    finally:
        await redis.close()

@router.websocket("/ws/{email}")
async def websocket_endpoint(websocket: WebSocket, email: str):
    await websocket.accept()
    
    async with get_redis() as redis:
        pubsub = redis.pubsub()
        channel = f"notifications:{email}"
        await pubsub.subscribe(channel)
        
        # Send stored notifications
        stored_key = f"stored_notifications:{email}"
        stored_notifications = await redis.lrange(stored_key, 0, -1)
        for notification in stored_notifications:
            await websocket.send_text(notification.decode())
        await redis.delete(stored_key)
        
        try:
            while True:
                message = await pubsub.get_message(ignore_subscribe_messages=True)
                if message:
                    data = message['data'].decode()
                    await websocket.send_text(data)
                else:
                    # Prevent high CPU usage
                    await asyncio.sleep(0.01)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            await pubsub.unsubscribe(channel)
            await pubsub.close()
            await websocket.close()