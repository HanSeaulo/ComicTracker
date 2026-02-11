import { EntryListRow } from "@/components/EntryListRow";

type EntryRowCardProps = {
  entryId: string;
  title: string;
  typeLabel: string;
  statusLabel: string;
  chaptersRead: number | null;
  totalChapters: number | null;
  coverImageUrl?: string | null;
};

export function EntryRowCard({
  entryId,
  title,
  typeLabel,
  statusLabel,
  chaptersRead,
  totalChapters,
  coverImageUrl,
}: EntryRowCardProps) {
  return (
    <EntryListRow
      entryId={entryId}
      title={title}
      subtitle={`${typeLabel} - ${statusLabel} - ${chaptersRead ?? "--"} / ${totalChapters ?? "--"}`}
      chaptersRead={chaptersRead}
      coverImageUrl={coverImageUrl}
    />
  );
}

