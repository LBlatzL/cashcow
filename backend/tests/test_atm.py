
import pytest
from unittest.mock import MagicMock

from app.models.atm import Status


@pytest.mark.asyncio
async def test_get_atms(client, mock_db):
    atm = MagicMock()

    atm.id = 1
    atm.serial_number = 1001
    atm.model = "NCR-500"
    atm.status = Status.operational
    atm.cash_level = 15
    atm.branch_id = 1
    atm.technician_id = 1

    result = MagicMock()
    result.scalars.return_value.all.return_value = [atm]

    mock_db.execute.return_value = result

    response = await client.get("/atm")

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["model"] == "NCR-500"
    assert response.json()[0]["status"] == "OPERATIONAL"
