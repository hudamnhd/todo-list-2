"use client";
import { generateResources, generateAppointments } from "../utils/fakeData";
import { useEffect, useState } from "react";
import { Appointment, Resource } from "@/models";
import Planner from "@/components/planner/Planner";
const initialResourcesData = [
  {
    id: "f504a05e-250e-45aa-aa1c-8a60034930c6",
    name: "Huda",
    type: "person",
    details: {
      description: "Front end Developer",
      image: "https://avatars.githubusercontent.com/u/127742560",
    },
  },
];
const initialAppointmentsData = [
  {
    id: "5197a2d6-287e-41e2-be53-e7718917b991",
    title: "Learn React js and React Router",
    start: "2024-11-03T00:07:58.399Z",
    end: "2024-11-03T22:07:58.399Z",
    resourceId: "f504a05e-250e-45aa-aa1c-8a60034930c6",
    order: 0,
    details: {
      notes: "Tester",
      service: "Framework",
      image: "https://picsum.photos/seed/e3wkMVA6i/3527/74",
    },
  },
];
export default function HomePage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    // const initResources = generateResources(1); // Generate 10 resources
    // const initAppointments = generateAppointments(1, initResources); // Generate 20 appointments linked to the resources
    setResources(initialResourcesData);
    setAppointments(initialAppointmentsData);
  }, []);
  return (
    <div className="flex min-h-full w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {appointments.length > 0 && (
          <Planner
            initialResources={resources}
            initialAppointments={appointments}
          />
        )}
      </main>
    </div>
  );
}
