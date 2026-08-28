import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  DollarSign,
  Inbox,
  Mail,
  MessageSquare,
  Phone,
  Trash2,
  User,
} from 'lucide-react';
import { InquiryMessage } from '../../types';
import { apiDeleteMessage, apiMarkMessageRead } from '../../lib/api';

interface MessagesManagerProps {
  messages: InquiryMessage[];
  onRefresh: () => void;
}

export function MessagesManager({ messages, onRefresh }: MessagesManagerProps) {
  const [selectedMsg, setSelectedMsg] = useState<InquiryMessage | null>(null);

  const handleMarkRead = async (m: InquiryMessage) => {
    try {
      await apiMarkMessageRead(m.id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this inquiry message?')) return;
    try {
      await apiDeleteMessage(id);
      if (selectedMsg?.id === id) setSelectedMsg(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const openWhatsApp = (m: InquiryMessage) => {
    const rawNumber = m.whatsapp.replace(/[^0-9]/g, '');
    const text = `Hi ${m.name}, thank you for reaching out to NIFTYGRAPHY regarding your ${m.projectType} project!`;
    window.open(`https://wa.me/${rawNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Client Inquiries & Messages
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Review leads and design project inquiries submitted through your website contact form.
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-muted-foreground mb-3">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No inquiries yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            When prospective clients submit your website contact form, their project details and WhatsApp contacts will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          {/* List column */}
          <div className="space-y-3">
            {messages.map((m) => {
              const isSelected = selectedMsg?.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedMsg(m);
                    if (!m.read) handleMarkRead(m);
                  }}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? 'border-accent bg-surface shadow-md'
                      : m.read
                      ? 'border-border bg-surface/40 hover:border-border/80'
                      : 'border-accent/60 bg-accent/5 hover:bg-accent/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface border border-border font-semibold text-accent text-xs">
                        {m.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-semibold text-foreground">{m.name}</h3>
                          {!m.read && (
                            <span className="rounded-full bg-accent px-1.5 py-0.5 text-[0.6rem] font-bold text-accent-foreground">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-[0.7rem] text-muted-foreground">{m.company || m.email}</p>
                      </div>
                    </div>

                    <span className="text-[0.68rem] text-muted-foreground whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-border/80 bg-background/50 px-2 py-0.5 text-[0.65rem] font-medium text-foreground">
                      {m.projectType}
                    </span>
                    <span className="rounded-md border border-border/80 bg-background/50 px-2 py-0.5 text-[0.65rem] text-muted-foreground">
                      {m.budget}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{m.message}</p>
                </div>
              );
            })}
          </div>

          {/* Details column */}
          <div className="sticky top-6 rounded-2xl border border-border bg-surface p-6">
            {selectedMsg ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-border">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">{selectedMsg.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {selectedMsg.company ? `${selectedMsg.company} · ` : ''}
                      {new Date(selectedMsg.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(selectedMsg.id)}
                    className="p-2 rounded-lg border border-border text-destructive hover:bg-destructive/15 transition-colors"
                    title="Delete Message"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Contact items */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-background/50 p-3">
                    <Mail className="h-4 w-4 text-accent" />
                    <div className="overflow-hidden">
                      <p className="text-[0.68rem] uppercase tracking-wider text-muted-foreground">Email</p>
                      <a
                        href={`mailto:${selectedMsg.email}`}
                        className="text-xs font-medium text-foreground hover:underline truncate block"
                      >
                        {selectedMsg.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-background/50 p-3">
                    <Phone className="h-4 w-4 text-accent" />
                    <div className="overflow-hidden">
                      <p className="text-[0.68rem] uppercase tracking-wider text-muted-foreground">WhatsApp</p>
                      <p className="text-xs font-medium text-foreground truncate">{selectedMsg.whatsapp}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-background/50 p-3">
                    <MessageSquare className="h-4 w-4 text-accent" />
                    <div>
                      <p className="text-[0.68rem] uppercase tracking-wider text-muted-foreground">Project Type</p>
                      <p className="text-xs font-medium text-foreground">{selectedMsg.projectType}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-background/50 p-3">
                    <DollarSign className="h-4 w-4 text-accent" />
                    <div>
                      <p className="text-[0.68rem] uppercase tracking-wider text-muted-foreground">Budget</p>
                      <p className="text-xs font-medium text-foreground">{selectedMsg.budget}</p>
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Project Message / Brief
                  </h3>
                  <div className="rounded-xl border border-border bg-background p-4 text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                    {selectedMsg.message}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => openWhatsApp(selectedMsg)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-accent px-4 py-2.5 text-xs font-semibold text-accent-foreground shadow-md hover:scale-102 transition-transform"
                  >
                    <Phone className="h-3.5 w-3.5" /> Reply on WhatsApp
                  </button>

                  <a
                    href={`mailto:${selectedMsg.email}?subject=${encodeURIComponent(
                      `Re: ${selectedMsg.projectType} Project Inquiry — NIFTYGRAPHY`
                    )}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-foreground hover:border-accent/60 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" /> Reply via Email
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-xs">Select an inquiry from the list to view full client message details.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
