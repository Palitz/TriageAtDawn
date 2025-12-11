import { Pool } from 'pg';

// Your Render Database URL (SSL is required for cloud DBs)
const connectionString = 'postgresql://triage_db_55tn_user:591Qvujbmvpqz38sPtA0lvGpZzZ08TqD@dpg-d4tg3rs9c44c73bnk8m0-a.singapore-postgres.render.com/triage_db_55tn?ssl=true';

const pool = new Pool({
  connectionString,
});

const sql = `
-- 1. Doctors
CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) DEFAULT 'General Physician'
);

-- 2. Shifts
CREATE TABLE IF NOT EXISTS shifts (
    id SERIAL PRIMARY KEY,
    doctor_id INT REFERENCES doctors(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    total_slots INT NOT NULL
);

-- 3. Slots
CREATE TABLE IF NOT EXISTS slots (
    id SERIAL PRIMARY KEY,
    shift_id INT REFERENCES shifts(id),
    start_time TIMESTAMP NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    version INT DEFAULT 1
);

-- 4. Patients
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    age INT,
    weight_kg INT,
    height_cm INT,
    medical_history TEXT,
    email VARCHAR(100) UNIQUE
);

-- 5. Ambulances
CREATE TABLE IF NOT EXISTS ambulances (
    id SERIAL PRIMARY KEY,
    plate_number VARCHAR(20),
    is_available BOOLEAN DEFAULT TRUE,
    current_location VARCHAR(100) DEFAULT 'Hospital Base'
);

-- 6. Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id),
    status VARCHAR(20) DEFAULT 'CONFIRMED',
    risk_score INT DEFAULT 1,
    booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    severity_level INT DEFAULT 1,
    ambulance_id INT REFERENCES ambulances(id),
    symptoms TEXT,
    specialization_needed VARCHAR(50),
    patient_name VARCHAR(100),
    patient_email VARCHAR(100)
);

-- 7. Booking Slots Link
CREATE TABLE IF NOT EXISTS booking_slots (
    booking_id INT REFERENCES bookings(id),
    slot_id INT REFERENCES slots(id),
    PRIMARY KEY (booking_id, slot_id)
);

-- Seed Data (Only if tables are empty)
INSERT INTO doctors (name, specialization) 
SELECT 'Dr. Bones', 'Orthopedics' WHERE NOT EXISTS (SELECT 1 FROM doctors WHERE name='Dr. Bones');

INSERT INTO doctors (name, specialization) 
SELECT 'Dr. Hart', 'Cardiology' WHERE NOT EXISTS (SELECT 1 FROM doctors WHERE name='Dr. Hart');

INSERT INTO doctors (name, specialization) 
SELECT 'Dr. Cure', 'Oncology' WHERE NOT EXISTS (SELECT 1 FROM doctors WHERE name='Dr. Cure');

INSERT INTO ambulances (plate_number) 
SELECT 'AMB-01' WHERE NOT EXISTS (SELECT 1 FROM ambulances WHERE plate_number='AMB-01');

INSERT INTO ambulances (plate_number) 
SELECT 'AMB-02' WHERE NOT EXISTS (SELECT 1 FROM ambulances WHERE plate_number='AMB-02');
`;

const seed = async () => {
  try {
    console.log('🌱 Connecting to Render Database...');
    await pool.query(sql);
    console.log('✅ Success! Remote database tables created and seeded.');
  } catch (err) {
    console.error('❌ Error seeding database:', err);
  } finally {
    await pool.end();
  }
};

seed();