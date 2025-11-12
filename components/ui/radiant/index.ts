// Thin adapters so we can import Radiant primitives without worrying
// whether the vendor files use default or named exports.

// Container
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ContainerDefault, { Container as ContainerNamed } from "@/components/ui/vendor/radiant/container";
// Button (we'll use later)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ButtonDefault, { Button as ButtonNamed } from "@/components/ui/vendor/radiant/button";

export const Container = (ContainerNamed ?? ContainerDefault) as any;
export const Button = (ButtonNamed ?? ButtonDefault) as any;

