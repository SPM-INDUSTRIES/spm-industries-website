"""Print stored customer inquiries in the terminal."""

from database import get_inquiries


if __name__ == "__main__":
    inquiries = get_inquiries()
    if not inquiries:
        print("No inquiries have been submitted yet.")
    for inquiry in inquiries:
        print(f"#{inquiry['id']} · {inquiry['created_at']}")
        print(
            f"Name: {inquiry['name']} | Phone: {inquiry['phone']} | "
            f"Email: {inquiry['email']}"
        )
        print(f"Message: {inquiry['message']}\n")
