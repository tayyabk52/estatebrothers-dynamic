import { inquiryCities, inquiryIntents, officeHours, offices } from "@/data/contact";
export async function getContactData() { return { inquiryCities, inquiryIntents, officeHours, offices }; }
