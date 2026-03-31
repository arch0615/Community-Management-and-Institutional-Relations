"use client";

import { useQuery } from "@tanstack/react-query";
import { MessageSquare, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";

export default function MessagesPage() {
  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const { data } = await api.get("/messages/conversations");
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["message-stats"],
    queryFn: async () => {
      const { data } = await api.get("/messages/stats");
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mensajes</h1>
        <p className="text-muted-foreground">Ver conversaciones e historial de mensajes</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Mensajes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
        {stats?.byDirection?.map((d: any) => (
          <Card key={d.direction}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                {d.direction === "INBOUND" ? (
                  <ArrowDownLeft className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowUpRight className="h-3 w-3 text-blue-500" />
                )}
                {d.direction === "INBOUND" ? "Recibidos" : "Enviados"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{d._count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conversations */}
      <Card>
        <CardHeader>
          <CardTitle>Conversaciones</CardTitle>
          <CardDescription>Contactos con historial de mensajes</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : conversations?.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aún no hay conversaciones</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations?.data?.map((contact: any) => {
                const lastMessage = contact.messages?.[0];
                return (
                  <div
                    key={contact.id}
                    className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                      {contact.firstName?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {contact.firstName} {contact.lastName}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {lastMessage && new Date(lastMessage.sentAt).toLocaleDateString("es-CL")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {lastMessage?.content || "Sin mensajes"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {lastMessage && (
                        <Badge variant="outline" className="text-xs">
                          {lastMessage.channel}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {contact._count?.messages || 0}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
