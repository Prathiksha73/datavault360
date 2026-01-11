import os
import django
import random
import datetime
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'datavault.settings')
django.setup()

from api.models import Room, InventoryItem, FinancialRecord

def seed_insights():
    print("Seeding Insights Data...")
    
    # 1. Update Room Status
    # Set 5 random empty rooms to MAINTENANCE
    empty_rooms = list(Room.objects.filter(patient__isnull=True))
    maintenance_count = 0
    if len(empty_rooms) >= 5:
        to_maintenance = random.sample(empty_rooms, 5)
        for r in to_maintenance:
            r.room_status = 'MAINTENANCE'
            r.save()
        maintenance_count = 5
        print(f"Set {maintenance_count} rooms to MAINTENANCE.")
    else:
        print("Not enough empty rooms to set maintenance.")

    # 2. Inventory
    print("Seeding Inventory...")
    InventoryItem.objects.all().delete()
    items = [
        ('Surgical Masks', 'Supplies', 'Box', 10.50),
        ('Gloves', 'Supplies', 'Box', 15.00),
        ('Syringes (5ml)', 'Medical', 'Unit', 0.50),
        ('Paracetamol', 'Pharmacy', 'Strip', 2.00),
        ('Antibiotics', 'Pharmacy', 'Strip', 12.00),
        ('Bandages', 'Supplies', 'Roll', 1.50),
        ('IV Dictionary', 'Medical', 'Bag', 5.00),
        ('Oxygen Cylinders', 'Equipment', 'Cylinder', 50.00),
        ('Defibrillator', 'Equipment', 'Unit', 2000.00),
        ('Bed Sheets', 'Housekeeping', 'Set', 20.00),
        ('Sanitizer (5L)', 'Supplies', 'Can', 25.00),
        ('Thermometer', 'Equipment', 'Unit', 30.00),
        ('Stethoscope', 'Equipment', 'Unit', 80.00),
        ('BP Monitor', 'Equipment', 'Unit', 60.00),
        ('Surgical Gown', 'Supplies', 'Piece', 15.00),
    ]
    
    for name, cat, unit, cost in items:
        qty = random.randint(5, 200)
        # Force some low stock
        if random.random() < 0.3:
            qty = random.randint(0, 8) 
            
        InventoryItem.objects.create(
            name=name,
            category=cat,
            quantity=qty,
            unit=unit,
            low_stock_threshold=10,
            cost_per_unit=cost
        )
    print(f"Created {len(items)} inventory items.")

    # 3. Financials
    print("Seeding Financials...")
    FinancialRecord.objects.all().delete()
    
    # Generate past 6 months
    today = datetime.date.today()
    start_date = today.replace(day=1) - datetime.timedelta(days=180) # Approx 6 months
    
    current = start_date
    while current <= today:
        # Generate random transactions for this month
        month_str = current.strftime("%B %Y")
        
        # Income: Consultations, Surgeries, Room Charges, Lab Tests
        for _ in range(random.randint(10, 20)):
            amt = random.randint(500, 5000)
            res = FinancialRecord.objects.create(
                transaction_type='INCOME',
                amount=amt,
                category=random.choice(['Consultation', 'Surgery', 'Room Charges', 'Lab Tests']),
                date=current + datetime.timedelta(days=random.randint(0, 28)),
                description=f"Income for {month_str}"
            )
            
        # Expenses: Salary, Equipment, Maintenance, Utilities
        for _ in range(random.randint(5, 15)):
            amt = random.randint(200, 3000)
            res = FinancialRecord.objects.create(
                transaction_type='EXPENSE',
                amount=amt,
                category=random.choice(['Salary', 'Equipment', 'Maintenance', 'Utilities', 'Inventory Restock']),
                date=current + datetime.timedelta(days=random.randint(0, 28)),
                description=f"Expense for {month_str}"
            )
            
        # Move to next month
        if current.month == 12:
            current = current.replace(year=current.year + 1, month=1)
        else:
            current = current.replace(month=current.month + 1)
            
    print("Financial data seeded.")

if __name__ == '__main__':
    seed_insights()
