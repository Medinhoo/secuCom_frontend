// Add these imports at the top of your file
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { useState } from "react";

// Add these types to your existing types
interface CalendarDay {
  date: string; // YYYY-MM-DD
  status: WorkStatus;
  hours?: number;
}

enum WorkStatus {
  WORKING_DAY = "WORKING_DAY",
  PAID_LEAVE = "PAID_LEAVE",
  UNPAID_LEAVE = "UNPAID_LEAVE",
  PUBLIC_HOLIDAY = "PUBLIC_HOLIDAY",
  SICK_LEAVE = "SICK_LEAVE",
  WEEKEND = "WEEKEND",
  TRAINING = "TRAINING",
}

const statusLabels: Record<WorkStatus, string> = {
  [WorkStatus.WORKING_DAY]: "Jour de travail",
  [WorkStatus.PAID_LEAVE]: "Congé payé",
  [WorkStatus.UNPAID_LEAVE]: "Congé sans solde",
  [WorkStatus.PUBLIC_HOLIDAY]: "Jour férié",
  [WorkStatus.SICK_LEAVE]: "Congé maladie",
  [WorkStatus.WEEKEND]: "Weekend",
  [WorkStatus.TRAINING]: "Formation",
};

const statusColors: Record<WorkStatus, string> = {
  [WorkStatus.WORKING_DAY]: "bg-green-100",
  [WorkStatus.PAID_LEAVE]: "bg-blue-100",
  [WorkStatus.UNPAID_LEAVE]: "bg-orange-100",
  [WorkStatus.PUBLIC_HOLIDAY]: "bg-purple-100",
  [WorkStatus.SICK_LEAVE]: "bg-red-100",
  [WorkStatus.WEEKEND]: "bg-gray-100",
  [WorkStatus.TRAINING]: "bg-yellow-100",
};

// Add this to your demoEmployees data structure (create a new Record for calendar data)
const demoCalendarData: Record<string, CalendarDay[]> = {
  emp1: [
    { date: "2025-03-01", status: WorkStatus.WEEKEND },
    { date: "2025-03-02", status: WorkStatus.WEEKEND },
    { date: "2025-03-03", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-04", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-05", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-06", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-07", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-08", status: WorkStatus.WEEKEND },
    { date: "2025-03-09", status: WorkStatus.WEEKEND },
    { date: "2025-03-10", status: WorkStatus.SICK_LEAVE },
    { date: "2025-03-11", status: WorkStatus.SICK_LEAVE },
    { date: "2025-03-12", status: WorkStatus.SICK_LEAVE },
    { date: "2025-03-13", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-14", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-15", status: WorkStatus.WEEKEND },
    { date: "2025-03-16", status: WorkStatus.WEEKEND },
    { date: "2025-03-17", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-18", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-19", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-20", status: WorkStatus.TRAINING },
    { date: "2025-03-21", status: WorkStatus.TRAINING },
    { date: "2025-03-22", status: WorkStatus.WEEKEND },
    { date: "2025-03-23", status: WorkStatus.WEEKEND },
    { date: "2025-03-24", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-25", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-26", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-27", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-28", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-29", status: WorkStatus.WEEKEND },
    { date: "2025-03-30", status: WorkStatus.WEEKEND },
    { date: "2025-03-31", status: WorkStatus.WORKING_DAY, hours: 8 },
    // Add April data
    { date: "2025-04-01", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-04-02", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-04-03", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-04-04", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-04-05", status: WorkStatus.WEEKEND },
    { date: "2025-04-06", status: WorkStatus.WEEKEND },
    { date: "2025-04-07", status: WorkStatus.PAID_LEAVE },
    { date: "2025-04-08", status: WorkStatus.PAID_LEAVE },
    { date: "2025-04-09", status: WorkStatus.PAID_LEAVE },
    { date: "2025-04-10", status: WorkStatus.PAID_LEAVE },
    { date: "2025-04-11", status: WorkStatus.PAID_LEAVE },
    { date: "2025-04-12", status: WorkStatus.WEEKEND },
    { date: "2025-04-13", status: WorkStatus.WEEKEND },
    { date: "2025-04-14", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-04-15", status: WorkStatus.PUBLIC_HOLIDAY },
    { date: "2025-04-16", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-04-17", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-04-18", status: WorkStatus.WORKING_DAY, hours: 8 },
  ],
  emp2: [
    // Similar structure for employee 2
    { date: "2025-03-01", status: WorkStatus.WEEKEND },
    { date: "2025-03-02", status: WorkStatus.WEEKEND },
    { date: "2025-03-03", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-04", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-05", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-06", status: WorkStatus.PAID_LEAVE },
    { date: "2025-03-07", status: WorkStatus.PAID_LEAVE },
    // Add more days as needed
  ],
  emp3: [
    // Similar structure for employee 3
    { date: "2025-03-01", status: WorkStatus.WEEKEND },
    { date: "2025-03-02", status: WorkStatus.WEEKEND },
    { date: "2025-03-03", status: WorkStatus.UNPAID_LEAVE },
    { date: "2025-03-04", status: WorkStatus.UNPAID_LEAVE },
    { date: "2025-03-05", status: WorkStatus.WORKING_DAY, hours: 8 },
    // Add more days as needed
  ],
};

// Add this helper function
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Add this component
export const PrestationsCalendar = ({ employeeId }: { employeeId: string }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth());

  const calendarData = demoCalendarData[employeeId] || [];

  // Get employee calendar data for selected month/year
  const filteredData = calendarData.filter((day) => {
    const date = new Date(day.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });

  // Create a map for quick lookup
  const dateStatusMap = new Map<number, CalendarDay>();
  filteredData.forEach((day) => {
    const date = new Date(day.date);
    dateStatusMap.set(date.getDate(), day);
  });

  // Calculate statistics
  const statusCounts = filteredData.reduce<Record<WorkStatus, number>>(
    (acc, day) => {
      acc[day.status] = (acc[day.status] || 0) + 1;
      return acc;
    },
    {} as Record<WorkStatus, number>
  );

  // Generate days of the month
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const days = [];

  // Handle month navigation
  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  // Add leading empty cells for the first week
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(
      <div key={`empty-${i}`} className="h-12 border border-gray-100"></div>
    );
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayData = dateStatusMap.get(day);
    const status = dayData?.status || WorkStatus.WORKING_DAY;
    const statusColorClass = statusColors[status];

    days.push(
      <TooltipProvider key={`day-${day}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`h-12 border border-gray-200 flex flex-col justify-between p-1 relative ${statusColorClass}`}
            >
              <span className="text-xs font-semibold">{day}</span>
              {dayData?.hours && (
                <span className="text-xs text-gray-600">{dayData.hours}h</span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{statusLabels[status]}</p>
            {dayData?.hours && <p>{dayData.hours} heures</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Calendrier des prestations</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={prevMonth}>
              &lt;
            </Button>
            <div className="flex items-center space-x-2">
              <Select
                value={month.toString()}
                onValueChange={(value) => setMonth(parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Mois" />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((name, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={year.toString()}
                onValueChange={(value) => setYear(parseInt(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Année" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => year - 2 + i).map(
                    (y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              &gt;
            </Button>
          </div>
        </div>
        <CardDescription>Suivi de la présence et des congés</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          {Object.entries(WorkStatus).map(([key, value]) => (
            <div key={key} className="flex items-center">
              <div
                className={`w-4 h-4 rounded mr-1 ${statusColors[value]}`}
              ></div>
              <span className="text-xs">{statusLabels[value]}</span>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <div className="grid grid-cols-7 gap-px">
            <div className="text-center font-medium text-xs p-1">Lun</div>
            <div className="text-center font-medium text-xs p-1">Mar</div>
            <div className="text-center font-medium text-xs p-1">Mer</div>
            <div className="text-center font-medium text-xs p-1">Jeu</div>
            <div className="text-center font-medium text-xs p-1">Ven</div>
            <div className="text-center font-medium text-xs p-1">Sam</div>
            <div className="text-center font-medium text-xs p-1">Dim</div>
          </div>
          <div className="grid grid-cols-7 gap-px">{days}</div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Récapitulatif du mois</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="border rounded p-2">
                <div className="text-xs text-gray-500">
                  {statusLabels[status as WorkStatus]}
                </div>
                <div className="text-lg font-semibold">
                  {count} {count > 1 ? "jours" : "jour"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Modify your TabsList to add the new tab
// In your PersonnelDetailsPage function, update the TabsList to add the new tab:
// Add this to your TabsList component:
