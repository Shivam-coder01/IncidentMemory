import json
import logging
import sys
from pathlib import Path
from datetime import datetime

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_dir))

from app.db.session import SessionLocal, engine, Base
from app.models.incident import Incident, IncidentResolution
from app.services.hindsight.memory_service import hindsight_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger("seed_demo_data")


def seed_demo_data():
    """
    Seed database and Hindsight memory bank with 10 realistic production incident scenarios.
    """
    data_path = backend_dir.parent / "data" / "demo_incidents.json"
    if not data_path.exists():
        logger.error(f"Demo data file not found at {data_path}")
        return

    with open(data_path, "r", encoding="utf-8") as f:
        incidents_data = json.load(f)

    logger.info(f"Loaded {len(incidents_data)} synthetic incident scenarios from {data_path.name}")

    # Ensure tables are created
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        retained_count = 0
        for item in incidents_data:
            incident_id = item["incident_id"]
            
            # Check if incident already exists in SQLite
            existing = db.query(Incident).filter(Incident.id == incident_id).first()
            if not existing:
                incident = Incident(
                    id=incident_id,
                    service=item["service"],
                    environment=item["environment"],
                    error_code=item.get("error_code"),
                    error_message=item["error_message"],
                    description=item["description"],
                    deployment_version=item.get("deployment_version"),
                    status="resolved",
                    created_at=datetime.utcnow(),
                    resolved_at=datetime.utcnow(),
                )
                db.add(incident)
                db.commit()

                resolution = IncidentResolution(
                    incident_id=incident_id,
                    root_cause=item["root_cause"],
                    resolution=item["resolution"],
                    outcome=item.get("outcome", "resolved"),
                    time_to_resolution=item.get("time_to_resolution", 20),
                )
                db.add(resolution)
                db.commit()
                logger.info(f"Seeded SQLite DB incident: {incident_id} ({item['service']})")

            # Retain in Hindsight persistent memory bank
            retain_res = hindsight_service.retain_incident(
                incident_id=incident_id,
                service=item["service"],
                environment=item["environment"],
                error_code=item.get("error_code") or "N/A",
                error_message=item["error_message"],
                description=item["description"],
                root_cause=item["root_cause"],
                resolution=item["resolution"],
                outcome=item.get("outcome", "resolved"),
                time_to_resolution=item.get("time_to_resolution"),
                deployment_version=item.get("deployment_version"),
            )
            if retain_res["status"] == "success":
                retained_count += 1

        logger.info(f"Successfully seeded {retained_count} incidents into Hindsight bank '{hindsight_service.bank_id}'!")

    except Exception as e:
        logger.error(f"Error seeding demo data: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()
