// src/app/page.js
"use client";

import { Button, Group, Container, Title } from "@mantine/core";
import Link from "next/link";
import GoogleSheetTable from "../components/GoogleSheetTable";

export default function Page() {
  return (
    <>
      <GoogleSheetTable />
    </>
  );
}
