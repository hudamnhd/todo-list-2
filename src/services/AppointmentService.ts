import { Appointment } from "@/models/Appointment";
import { getCache, setCache } from "@/lib/cache-client";
const cacheKey = `appointments`;

export class AppointmentService {
  private appointments: Appointment[];

  constructor() {
    this.appointments = [];
  }

  async initialize(initialAppointments: Appointment[]) {
    // Cek apakah data ada di localforage, jika tidak gunakan initialAppointments

    const storedAppointments = await getCache<Appointment[]>(cacheKey);
    this.appointments = storedAppointments || initialAppointments;
  }

  private async saveToLocalForage() {
    await setCache(cacheKey, this.appointments);
  }

  async createAppointment(appointment: Appointment) {
    this.appointments.push(appointment);
    await this.saveToLocalForage();
    return this.appointments;
  }

  async updateAppointment(updatedAppointment: Appointment) {
    const index = this.appointments.findIndex(
      (a) => a.id === updatedAppointment.id,
    );
    if (index !== -1) {
      this.appointments[index] = {
        ...this.appointments[index],
        ...updatedAppointment,
      };
      await this.saveToLocalForage();
    }
    return this.appointments;
  }

  async deleteAppointment(id: string) {
    this.appointments = this.appointments.filter((a) => a.id !== id);
    await this.saveToLocalForage();
    return this.appointments;
  }

  getAppointments() {
    return [...this.appointments];
  }
}
