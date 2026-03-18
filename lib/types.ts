export type Address = {
    id: number;
    full_address: string;
    street: string;
    city: string;
    state: string;
    zip: string;
};

export type DriverTruckInfo = {
    id: number;
    driver: string;
    truck_type: string;
    driver_phone: string;
};

export type Job = {
  id: number;
  job_number: string;
  project: string;
  job_date: string; // YYYY-MM-DD format
  shift_start: string; // HH:MM format
  material: string;
  job_foreman_name: string;
  job_foreman_contact: string;
  additional_notes: string;
  loading_address: number;
  unloading_address: number;
  loading_address_info: Address;
  unloading_address_info: Address;
  backhaul_loading_address_info: Address | null;
  backhaul_unloading_address_info: Address | null;
  is_backhaul_enabled: boolean;
  driver_assignments: DriverAssignment[];
};

export type DriverAssignment = {
    id: number;
    driver_truck_info: DriverTruckInfo;
};