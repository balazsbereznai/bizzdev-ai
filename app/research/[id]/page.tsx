"use client";
import { useParams } from "next/navigation";
import DocView from "../../_components/DocView";

export default function ResearchPage() {
  const { id } = useParams<{ id: string }>();
  return <DocView id={id} heading="Client Research & Product Fit" />;
}

