"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, MessageSquare, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import type { Contact } from "@/lib/types";

export default function ContactDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: contact, isLoading } = useQuery<Contact & {
    interactions: any[];
    messages: any[];
    segments: any[];
  }>({
    queryKey: ["contact", id],
    queryFn: async () => {
      const { data } = await api.get(`/contacts/${id}`);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!contact) return <p>Contacto no encontrado</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/contacts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {contact.firstName} {contact.lastName}
          </h1>
          <p className="text-muted-foreground">Detalles del contacto e historial de interacciones</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Contact Info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Información del Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
              {contact.firstName.charAt(0)}{contact.lastName?.charAt(0) || ""}
            </div>

            {contact.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {contact.email}
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {contact.phone}
              </div>
            )}
            {contact.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {contact.location}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Agregado el {new Date(contact.createdAt).toLocaleDateString("es-CL")}
            </div>

            <div className="pt-2">
              <p className="text-sm font-medium mb-2">Estado</p>
              <Badge variant={contact.status === "ACTIVE" ? "default" : "secondary"}>
                {contact.status}
              </Badge>
            </div>

            {contact.gender && (
              <div>
                <p className="text-sm font-medium mb-1">Género</p>
                <p className="text-sm text-muted-foreground">{contact.gender}</p>
              </div>
            )}

            {contact.tags && contact.tags.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Etiquetas
                </p>
                <div className="flex flex-wrap gap-1">
                  {contact.tags.map((ct: any) => (
                    <Badge key={ct.tag.id} variant="outline" style={{ borderColor: ct.tag.color }}>
                      {ct.tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {contact.interests && contact.interests.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Intereses</p>
                <div className="flex flex-wrap gap-1">
                  {contact.interests.map((ci: any) => (
                    <Badge key={ci.interest.id} variant="secondary">
                      {ci.interest.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interactions & Messages */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interacciones Recientes</CardTitle>
              <CardDescription>Historial de interacciones más reciente</CardDescription>
            </CardHeader>
            <CardContent>
              {contact.interactions?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aún no hay interacciones</p>
              ) : (
                <div className="space-y-4">
                  {contact.interactions?.map((interaction: any) => (
                    <div key={interaction.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{interaction.type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(interaction.date).toLocaleString("es-CL")}
                          </span>
                        </div>
                        {interaction.subject && (
                          <p className="text-sm font-medium mt-1">{interaction.subject}</p>
                        )}
                        {interaction.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{interaction.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mensajes</CardTitle>
              <CardDescription>Historial de mensajes recientes</CardDescription>
            </CardHeader>
            <CardContent>
              {contact.messages?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aún no hay mensajes</p>
              ) : (
                <div className="space-y-3">
                  {contact.messages?.map((message: any) => (
                    <div
                      key={message.id}
                      className={`flex ${message.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.direction === "OUTBOUND"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] h-4">
                            {message.channel}
                          </Badge>
                          <span className="text-[10px] opacity-70">
                            {new Date(message.sentAt).toLocaleString("es-CL")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
