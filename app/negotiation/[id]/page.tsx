"use client";
import { useParams } from "next/navigation";
import DocView from "../../_components/DocView";

export default function NegotiationPage() {
  const { id } = useParams<{ id: string }>();
  return <DocView id={id} heading="Negotiation Preparation" />;
}
