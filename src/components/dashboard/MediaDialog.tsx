import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Image, Download } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { ChatMessage } from '@/types';

interface MediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: ChatMessage[];
}

export function MediaDialog({ open, onOpenChange, messages }: MediaDialogProps) {
  // Filter messages that have attachments
  const mediaMessages = messages.filter(msg => msg.attachmentUrl);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Media e Allegati ({mediaMessages.length})
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh]">
          {mediaMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mb-3 opacity-50" />
              <p>Nessun allegato in questa chat</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
              {mediaMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Preview */}
                  <div className="aspect-square bg-muted relative group cursor-pointer">
                    {msg.attachmentResourceType === 'image' ? (
                      <img
                        src={msg.attachmentUrl}
                        alt={msg.attachmentName || 'Immagine'}
                        className="w-full h-full object-cover"
                        onClick={() => window.open(msg.attachmentUrl, '_blank')}
                      />
                    ) : (
                      <div
                        className="w-full h-full flex flex-col items-center justify-center gap-2"
                        onClick={() => window.open(msg.attachmentUrl, '_blank')}
                      >
                        <FileText className="h-12 w-12 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-mono">
                          {msg.attachmentMimetype?.split('/')[1]?.toUpperCase() || 'FILE'}
                        </span>
                      </div>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Download className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-1">
                    <p className="text-sm font-medium truncate" title={msg.attachmentName}>
                      {msg.attachmentName || 'File'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(msg.attachmentSize)}</span>
                      <span>{format(new Date(msg.timestamp), 'dd/MM/yy', { locale: it })}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="capitalize">{msg.type}</span>
                      {msg.operatorName && (
                        <>
                          <span>•</span>
                          <span>{msg.operatorName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
