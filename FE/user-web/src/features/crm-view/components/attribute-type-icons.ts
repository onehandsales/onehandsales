import { Banknote, Calendar, CalendarClock, CheckSquare, CircleDot, Globe, Hash, Link2, ListFilter, Mail, MapPin, MessageSquare, Phone, Star, Type, User, UserRound, type LucideIcon } from "lucide-react";
import type { AttributeDefinitionValueType } from "@/features/crm-object";

export const ATTRIBUTE_TYPE_ICONS: Record<AttributeDefinitionValueType, LucideIcon> = {
  Text: Type, Number: Hash, Currency: Banknote, Checkbox: CheckSquare, Date: Calendar, Timestamp: CalendarClock,
  Select: ListFilter, Status: CircleDot, Rating: Star, EmailAddress: Mail, PhoneNumber: Phone, Domain: Globe,
  Location: MapPin, PersonalName: UserRound, RecordReference: Link2, ActorReference: User, Interaction: MessageSquare,
};
