'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle, Mail, MapPin } from 'lucide-react';

export function ContactMethods() {
  const contactMethods = [
    {
      title: 'Assistance d\'urgence',
      description: 'Pour les situations d\'urgence uniquement',
      icon: Phone,
      action: 'Appeler maintenant',
      href: 'tel:+33123456789',
      color: 'bg-red-500',
    },
    {
      title: 'Chat en direct',
      description: 'Assistance immédiate par chat',
      icon: MessageCircle,
      action: 'Démarrer le chat',
      href: '#',
      color: 'bg-blue-500',
    },
    {
      title: 'Email',
      description: 'Réponse sous 24-48h',
      icon: Mail,
      action: 'Envoyer un email',
      href: 'mailto:contact@consulat.ga',
      color: 'bg-green-500',
    },
    {
      title: 'Se rendre au consulat',
      description: 'Rendez-vous sur place',
      icon: MapPin,
      action: 'Prendre RDV',
      href: '#',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Méthodes de contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contactMethods.map((method, index) => {
          const Icon = method.icon;
          return (
            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className={`w-16 h-16 ${method.color} rounded-full flex items-center justify-center text-white mx-auto mb-4`}>
                <Icon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{method.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{method.description}</p>
              <Button asChild>
                <a href={method.href}>{method.action}</a>
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Informations de contact */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Informations de contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">Adresse</h4>
              <p className="text-sm text-muted-foreground">
                26 bis avenue Raphaël<br />
                75016 Paris, France
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Téléphone</h4>
              <p className="text-sm text-muted-foreground">+33 1 45 00 97 57</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">Email</h4>
              <p className="text-sm text-muted-foreground">contact@consulat.ga</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Horaires</h4>
              <p className="text-sm text-muted-foreground">
                Lun-Ven: 9h-17h<br />
                Fermé le weekend
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}