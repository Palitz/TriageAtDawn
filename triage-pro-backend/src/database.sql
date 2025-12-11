CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) DEFAULT 'General Physician'
);

CREATE TABLE shifts (
    id SERIAL PRIMARY KEY,
    doctor_id INT REFERENCES doctors(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    total_slots INT NOT NULL
);

CREATE TABLE slots (
    id SERIAL PRIMARY KEY,
    shift_id INT REFERENCES shifts(id),
    start_time TIMESTAMP NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    version INT DEFAULT 1 
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    patient_name VARCHAR(100) NOT NULL,
    patient_email VARCHAR(100) NOT NULL,
    booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'CONFIRMED', 
    risk_score INT DEFAULT 1 
);

CREATE TABLE booking_slots (
    booking_id INT REFERENCES bookings(id),
    slot_id INT REFERENCES slots(id),
    PRIMARY KEY (booking_id, slot_id)
);