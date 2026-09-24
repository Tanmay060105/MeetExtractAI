import asyncio
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.core.security import get_password_hash
from sqlalchemy import select, update

async def fix_dev_user():
    async with AsyncSessionLocal() as db:
        old_email = "dev@meetextract.local"
        new_email = "dev@example.com"
        dev_password = "securepassword123"
        
        result = await db.execute(select(User).where(User.email == old_email))
        dev_user = result.scalars().first()
        
        if dev_user:
            dev_user.email = new_email
            dev_user.hashed_password = get_password_hash(dev_password)
            await db.commit()
            print(f"Updated dev user email to {new_email}")
        else:
            result = await db.execute(select(User).where(User.email == new_email))
            dev_user = result.scalars().first()
            if not dev_user:
                new_user = User(
                    email=new_email,
                    hashed_password=get_password_hash(dev_password),
                    full_name="Developer Account",
                    is_active=True
                )
                db.add(new_user)
                await db.commit()
                print(f"Created dev user with email {new_email}")
            else:
                dev_user.hashed_password = get_password_hash(dev_password)
                await db.commit()
                print(f"Dev user {new_email} already exists. Password reset.")
                
        print("\n=== CORRECT DEV CREDENTIALS ===")
        print(f"Email: {new_email}")
        print(f"Password: {dev_password}")
        print("===============================")

if __name__ == "__main__":
    asyncio.run(fix_dev_user())
