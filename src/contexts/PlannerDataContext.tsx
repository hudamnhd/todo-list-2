import { Spinner } from "@/components/ui/spinner";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  FC,
} from "react";
import { AppointmentService, ResourceService } from "../services";
import { Appointment, Resource } from "../models";

interface DataContextType {
  appointments: Appointment[];
  resources: Resource[];
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (appointment: Appointment) => void;
  removeAppointment: (id: string) => void;
  addResource: (resource: Resource) => void;
  updateResource: (resource: Resource) => void;
  removeResource: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const PlannerDataContextProvider: FC<{
  children: ReactNode;
  initialAppointments: Appointment[];
  initialResources: Resource[];
}> = ({ children, initialAppointments, initialResources }) => {
  const [appointmentService, setAppointmentService] =
    useState<AppointmentService | null>(null);
  const resourceService = useState(new ResourceService(initialResources))[0];
  const [isLoading, setIsLoading] = useState(true); // Tambahkan loading state
  const [trigger, setTrigger] = useState(false);

  const handleUpdate = () => setTrigger(!trigger);

  React.useEffect(() => {
    const initializeServices = async () => {
      const service = new AppointmentService();
      await service.initialize(initialAppointments); // Load data from localforage or fallback
      setAppointmentService(service);
      setIsLoading(false); // Set loading state to false
    };

    initializeServices();
  }, [initialAppointments]);

  if (isLoading) {
    return (
      <div className="absolute h-full w-full flex items-center justify-center bottom-0 left-1/2 transform -translate-x-1/2  z-20 backdrop-blur-[1px] rounded-xl">
        <div className="flex justify-center">
          <Spinner>Loading...</Spinner>
        </div>
      </div>
    ); // Tampilkan indikator loading
  }

  if (!appointmentService) {
    return (
      <div className="absolute h-full w-full flex items-center justify-center bottom-0 left-1/2 transform -translate-x-1/2 backdrop-blur-[1px] rounded-xl">
        <div className="flex justify-center">Error initializing service</div>
      </div>
    ); // Render fallback jika ada masalah
  }

  const contextValue: DataContextType = {
    appointments: appointmentService.getAppointments(),
    resources: resourceService.getResources(),
    addAppointment: async (appointment) => {
      await appointmentService.createAppointment(appointment);
      handleUpdate();
    },
    updateAppointment: async (appointment) => {
      await appointmentService.updateAppointment(appointment);
      handleUpdate();
    },
    removeAppointment: async (id) => {
      await appointmentService.deleteAppointment(id);
      handleUpdate();
    },
    addResource: (resource) => {
      resourceService.addResource(resource);
      handleUpdate();
    },
    updateResource: (resource) => {
      resourceService.updateResource(resource);
      handleUpdate();
    },
    removeResource: (id) => {
      resourceService.removeResource(id);
      handleUpdate();
    },
  };

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a PlannerDataContextProvider");
  }
  return context;
};
