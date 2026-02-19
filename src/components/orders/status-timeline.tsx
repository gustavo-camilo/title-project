import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Clock } from "lucide-react";

interface StatusEvent {
  id: string;
  old_status: string | null;
  new_status: string;
  created_at: string;
  notes: string | null;
}

interface StatusTimelineProps {
  events: StatusEvent[];
  statusLabels: Record<string, string>;
}

const statusIcons: Record<string, typeof CheckCircle> = {
  submitted: Circle,
  assigned: Clock,
  in_progress: Clock,
  in_review: Clock,
  completed: CheckCircle,
  revision_requested: Clock,
  cancelled: Circle,
};

export function StatusTimeline({ events, statusLabels }: StatusTimelineProps) {
  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => {
        const Icon = statusIcons[event.new_status] || Circle;
        const isLast = index === 0;

        return (
          <div key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  isLast
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              {index < events.length - 1 && (
                <div className="mt-1 h-full w-px bg-border" />
              )}
            </div>
            <div className="pb-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant={isLast ? "default" : "secondary"}
                  className={isLast ? "bg-primary text-primary-foreground" : ""}
                >
                  {statusLabels[event.new_status] || event.new_status}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(event.created_at).toLocaleString()}
              </p>
              {event.notes && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {event.notes}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
