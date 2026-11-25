from app.database import models as m


def test_auto_select_matches_directory_ranking(client, prefix, auth, database):
    with database() as db:
        db.add(m.ServiceRequest(request_no="FF-RANK", customer_id=5, category_id=1))
        for technician_id, ratings in [(3, [4]), (4, [4, 4])]:
            for index, rating in enumerate(ratings):
                request = m.ServiceRequest(
                    request_no=f"FF-REVIEW-{technician_id}-{index}", customer_id=5, category_id=1,
                )
                job = m.Job(request=request, technician_id=technician_id, status=m.JobStatus.closed)
                db.add(m.Review(job=job, technician_id=technician_id, customer_id=5, rating=rating))
        db.commit()

    directory = prefix + "/technicians"
    auto = prefix + "/requests/FF-RANK/auto-select"
    customer = auth(5, "customer")

    def assert_match(ids):
        response = client.get(directory, params={"category": "plumbing", "available": True, "bestMatch": True})
        assert response.status_code == 200
        assert [item["id"] for item in response.json()["data"]] == ids
        response = client.post(auto, headers=customer)
        assert response.status_code == 200
        assert response.json()["data"]["id"] == ids[0]

    assert_match(["4", "3"])
    with database() as db:
        review = db.query(m.Review).filter_by(technician_id=4).first()
        db.delete(review)
        db.commit()
    assert_match(["3", "4"])
    with database() as db:
        db.get(m.Technician, 3).availability = m.AvailabilityStatus.busy
        db.commit()
    assert_match(["4"])
