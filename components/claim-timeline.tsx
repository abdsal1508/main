import { Card, CardContent } from "@/components/ui/card"

interface ClaimTimelineProps {
  claimId: string
}

export function ClaimTimeline({ claimId }: ClaimTimelineProps) {
  // In a real app, you would fetch the claim history from your API
  const events = [
    {
      id: 1,
      date: "May 21, 2025 10:30 AM",
      title: "Claim Submitted",
      description: "Claim submitted to Blue Cross via EDI 837.",
    },
    {
      id: 2,
      date: "May 21, 2025 10:35 AM",
      title: "Acknowledgment Received",
      description: "Received 997 functional acknowledgment from clearinghouse.",
    },
    {
      id: 3,
      date: "May 21, 2025 11:15 AM",
      title: "Status Update",
      description: "Received 277 claim status notification. Claim is pending review.",
    },
  ]

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="flex gap-4">
          <div className="relative flex flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-teal-600 bg-teal-50 text-teal-600">
              <div className="h-2 w-2 rounded-full bg-teal-600" />
            </div>
            {event.id !== events.length && <div className="h-full w-px bg-border" />}
          </div>
          <Card className="flex-1">
            <CardContent className="p-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{event.date}</p>
                <p className="font-medium">{event.title}</p>
                <p className="text-sm">{event.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}
