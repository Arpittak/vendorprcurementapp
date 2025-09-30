
-- Drop child tables first (those with foreign keys)
DROP TABLE IF EXISTS procurement_items;
DROP TABLE IF EXISTS procurements;
DROP TABLE IF EXISTS inventory_transactions;
DROP TABLE IF EXISTS inventory_items;

-- Drop parent/independent tables
DROP TABLE IF EXISTS hsn_codes;
DROP TABLE IF EXISTS finishing_types;
DROP TABLE IF EXISTS edges_types;
DROP TABLE IF EXISTS stages;
DROP TABLE IF EXISTS stones;
DROP TABLE IF EXISTS vendors;



-- 1. Independent tables (no foreign keys)
CREATE TABLE vendors (
id INT AUTO_INCREMENT PRIMARY KEY,
company_name VARCHAR(255) NOT NULL UNIQUE,
contact_person VARCHAR(255),
phone_number VARCHAR(20),
email_address VARCHAR(255),
city VARCHAR(100),
state VARCHAR(100),
state_code VARCHAR(10),
complete_address TEXT,
gst_number VARCHAR(15) UNIQUE,
bank_details TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE stones (
id INT AUTO_INCREMENT PRIMARY KEY,
stone_name VARCHAR(100) NOT NULL,
stone_type VARCHAR(100),
UNIQUE (stone_name, stone_type)
);
CREATE TABLE stages (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) UNIQUE NOT NULL
);
CREATE TABLE edges_types (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) UNIQUE NOT NULL
);
CREATE TABLE finishing_types (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) UNIQUE NOT NULL
);
CREATE TABLE hsn_codes (
id INT AUTO_INCREMENT PRIMARY KEY,
code VARCHAR(10) UNIQUE NOT NULL
);


-- 2. Tables with dependencies on above tables
CREATE TABLE inventory_items (
id INT AUTO_INCREMENT PRIMARY KEY,
stone_id INT NOT NULL,
length_mm INT NOT NULL,
width_mm INT NOT NULL,
thickness_mm INT,
is_calibrated BOOLEAN DEFAULT FALSE,
edges_type_id INT,
finishing_type_id INT,
stage_id INT,
source ENUM('procurement', 'manual') NOT NULL,
comments TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (stone_id) REFERENCES stones(id),
FOREIGN KEY (edges_type_id) REFERENCES edges_types(id),
FOREIGN KEY (finishing_type_id) REFERENCES finishing_types(id),
FOREIGN KEY (stage_id) REFERENCES stages(id),
UNIQUE KEY unique_stock_item (stone_id, length_mm, width_mm, thickness_mm, is_calibrated, edges_type_id, finishing_type_id, stage_id, source)
);
CREATE TABLE inventory_transactions (
id INT AUTO_INCREMENT PRIMARY KEY,
inventory_item_id INT NOT NULL,
transaction_type ENUM(
'procurement_initial_stock',
'procurement_quantity_added',
'manual_add',
'manual_remove',
'sale',
'wastage',
'procurement_item_deleted'
) NOT NULL,
change_in_pieces INT NOT NULL,
change_in_sq_meter DECIMAL(10, 4) NOT NULL,
balance_after_pieces INT NOT NULL,
balance_after_sq_meter DECIMAL(10, 4) NOT NULL,
reason TEXT,
source_details VARCHAR(255),
performed_by VARCHAR(100),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
);




CREATE TABLE procurements (
id INT AUTO_INCREMENT PRIMARY KEY,
vendor_id INT NOT NULL,
invoice_date DATE,
supplier_invoice VARCHAR(255),
vehicle_number VARCHAR(100),
gst_type ENUM('IGST', 'CGST', 'SGST') DEFAULT 'IGST',
tax_percentage DECIMAL(5, 2) DEFAULT 0.00,
freight_charges DECIMAL(10, 2) DEFAULT 0.00,
additional_taxable_amount DECIMAL(10, 2) DEFAULT 0.00,
grand_total DECIMAL(12, 2) NOT NULL,
comments TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE RESTRICT
);
CREATE TABLE procurement_items (
id INT AUTO_INCREMENT PRIMARY KEY,
procurement_id INT NOT NULL,
stone_id INT NOT NULL,
hsn_code_id INT,
inventory_item_id INT,
length_mm INT NOT NULL,
width_mm INT NOT NULL,
thickness_mm INT,
is_calibrated BOOLEAN DEFAULT FALSE,
edges_type_id INT,
finishing_type_id INT,
stage_id INT,
quantity DECIMAL(10, 2) NOT NULL,
units ENUM('Sq Meter') NOT NULL DEFAULT 'Sq Meter',
rate_unit ENUM('Pieces', 'Sq Meter') NOT NULL,
rate DECIMAL(10, 2) NOT NULL,
item_amount DECIMAL(12, 2) NOT NULL,
comments TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (procurement_id) REFERENCES procurements(id) ON DELETE CASCADE,
FOREIGN KEY (stone_id) REFERENCES stones(id),
FOREIGN KEY (hsn_code_id) REFERENCES hsn_codes(id),
FOREIGN KEY (stage_id) REFERENCES stages(id),
FOREIGN KEY (edges_type_id) REFERENCES edges_types(id),
FOREIGN KEY (finishing_type_id) REFERENCES finishing_types(id),
FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE SET NULL
);



-- HSN Codes
INSERT INTO hsn_codes (code) VALUES ('2516'), ('6802'), ('6801');
-- Stones - Limestone
INSERT INTO stones (stone_name, stone_type) VALUES
('Tandur Grey', 'Limestone'), ('Kumod Grey', 'Limestone'), ('Tandur Yellow', 'Limestone'),
('Kota Brown', 'Limestone'), ('Kota Blue', 'Limestone'), ('Lime Peacock', 'Limestone'),
('Lime Green', 'Limestone'), ('Lime Black', 'Limestone');
-- Stones - Sandstone
INSERT INTO stones (stone_name, stone_type) VALUES
('Kandla Grey', 'Sandstone'), ('Raj Green', 'Sandstone'), ('Raveena', 'Sandstone'), ('Panther', 'Sandstone'),
('Autumn Brown', 'Sandstone'), ('Buff/Camel Dust', 'Sandstone'), ('Fossil Mint', 'Sandstone'), ('Modak', 'Sandstone'),
('Yellow Mint', 'Sandstone'), ('Ripon/Beige Buff', 'Sandstone'), ('Mandana', 'Sandstone'), ('White Mint/Tint Mint', 'Sandstone'),
('Toskana', 'Sandstone'), ('Sagar Black', 'Sandstone'), ('Yellow Teakwood', 'Sandstone'), ('Rustic Grey', 'Sandstone'),
('Rainbow', 'Sandstone'), ('L. Grey', 'Sandstone'), ('L. Yellow', 'Sandstone'), ('Kota Desert', 'Sandstone'),
('K. Black', 'Sandstone'), ('J Red', 'Sandstone'), ('Jaisalmer Yellow/Mellow Yellow', 'Sandstone'), ('Ita Gold', 'Sandstone'),
('J. Pink', 'Sandstone'), ('Dholpur Beige', 'Sandstone'), ('Flowery Gold', 'Sandstone'), ('Camel Dust', 'Sandstone'),
('Asian Gold', 'Sandstone'), ('Desert Mint', 'Sandstone');
-- Stones - Marble
INSERT INTO stones (stone_name, stone_type) VALUES
('Makrana White', 'Marble'), ('Albeta', 'Marble'), ('Mercury Black', 'Marble'), ('Carbon Black', 'Marble'),
('Spider Green', 'Marble'), ('Black Marrie', 'Marble'), ('Forest Green', 'Marble'), ('Green Onyx', 'Marble'),
('Alaska White', 'Marble'), ('Cloud Grey', 'Marble'), ('Pink', 'Marble'), ('Polar White', 'Marble'),
('Sky Blue', 'Marble'), ('Sky White Blue', 'Marble'), ('Pink Onyx', 'Marble'), ('Plane Green', 'Marble'),
('White Onyx', 'Marble'), ('Fantasy Brown', 'Marble'), ('Rain Forest Brown', 'Marble'), ('Bruno White', 'Marble'),
('Rain Forest Golden', 'Marble'), ('Rain Forest Green', 'Marble'), ('Staturio', 'Marble'), ('Rajnagar White', 'Marble'),
('Barswara White', 'Marble'), ('River Blue', 'Marble'), ('Panda White', 'Marble');
-- Stones - Slate
INSERT INTO stones (stone_name, stone_type) VALUES
('Rosa', 'Slate'), ('M Green', 'Slate'), ('Multi Pink', 'Slate'), ('Multi Colour', 'Slate'),
('Pure Pink', 'Slate'), ('Red Gold', 'Slate'), ('SRA', 'Slate'), ('Tera Red', 'Slate'),
('Vijaya Gold', 'Slate'), ('Yellow Muth', 'Slate'), ('Yellow Rustic', 'Slate'), ('N Green', 'Slate'),
('JAK Multicolour', 'Slate'), ('Multicolour Peacock', 'Slate'), ('Black Rustic', 'Slate'), ('Black', 'Slate'),
('Chocolate', 'Slate'), ('S.P. Autumn', 'Slate'), ('Indian Autumn', 'Slate'), ('Lilac', 'Slate'), ('M Green (Rustic)', 'Slate');
-- Stages
INSERT INTO stages (name) VALUES
('Raw material'), ('Cutting Completed'), ('Edges Completed'), ('Calibration Completed'), ('Finished Completed'), ('Packaging Completed');
-- Edge Types
INSERT INTO edges_types (name) VALUES
('Raw'), ('Handcut'), ('Straight Cut'), ('Machine Cut'), ('Sawn'), ('Full Bullnose'), ('Half Bullnose'), ('Tumbled');
-- Finishing Types
INSERT INTO finishing_types (name) VALUES
('Raw'), ('Natural'), ('Flamed'), ('Sandblast'), ('Honed'), ('Polished'), ('Sawn & Sandblasted');
-- Sample Vendors
INSERT INTO vendors (company_name, contact_person, phone_number, email_address, city, state) VALUES
('M/S. KHALSHA STONE IMPORIUM', '', '9753111290', NULL, 'VIDISHA', 'MADHYA PRADESH'),
('SAGAR METALS COMPANY', '', '9460011076', NULL, 'KOTA', 'Rajasthan'),
('GALAXY STONES', '', '9636204007', NULL, 'KOTA', 'Rajasthan'),
('Yaduvanshi Stone Industries', '', NULL, NULL, NULL, NULL),
('Shitla Stones', '', '9303326869', NULL, 'Banmore', 'M.P.'),
('G G GRANITE Pvt Ltd', '', NULL, NULL, 'MORENA', 'Madhya Pradesh'),
('SS Granite Pvt Ltd', 'Rohan Jain', '6089825130', 'rohan4324@gmail.com', 'Long Beach', 'CA'),
('URMILA STONE COMPANY', 'Vaishali Yadav', '0982891222', 'vaishali.lochab@gmail.com', 'Kota', 'Rajasthan'),
('Google', 'Samyak Kobra', '6089825130', 'patelayush07@gmail.com', 'San Jose', 'CA'),
('Alphabet', 'Sundar Pichai', '6089825130', 'Pichai@alphabet.com', 'Madison', 'Wisconsin'),
('Test Vendor', 'John Doe', '1234567890', 'test@test.com', 'Test City', 'Test State'),
('Meta', 'Rohan Jain', '6089825130', 'rohan4324@gmail.com', 'Long Beach', 'CA');




-- ALTER TABLE inventory_transactions
-- ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;  changes in current file
