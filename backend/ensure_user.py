import asyncio
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.core.security import get_password_hash
from sqlalchemy import select

async def ensure_dev_user():
    async with AsyncSessionLocal() as db:
        # Check if users exist
        result = await db.execute(select(User))
        users = result.scalars().all()
        
        if users:
            print(f"Found {len(users)} users.")
            for u in users:
                print(f"- {u.email} (ID: {u.id})")
        
        # Check for specific dev user
        dev_email = "dev@meetextract.local"
        dev_password = "securepassword123"
        
        result = await db.execute(select(User).where(User.email == dev_email))
        dev_user = result.scalars().first()
        
        if dev_user:
            print(f"Dev user '{dev_email}' already exists.")
            # Overwrite password just to be sure we know it
            dev_user.hashed_password = get_password_hash(dev_password)
            await db.commit()
            print("Password has been reset to known dev password.")
        else:
            print(f"Creating dev user '{dev_email}'...")
            new_user = User(
                email=dev_email,
                hashed_password=get_password_hash(dev_password),
                full_name="Developer Account",
                is_active=True
            )
            db.add(new_user)
            await db.commit()
            print("Dev user created successfully.")
            
        print("\n=== DEV CREDENTIALS ===")
        print(f"Email: {dev_email}")
        print(f"Password: {dev_password}")
        print("=======================")

if __name__ == "__main__":
    asyncio.run(ensure_dev_user())
