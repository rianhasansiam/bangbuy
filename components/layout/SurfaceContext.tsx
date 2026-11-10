"use client";

import { createContext, useContext } from "react";
import type { Surface } from "@/lib/security/surfaces";

export const SurfaceContext = createContext<Surface>("private");
export function useSurface(): Surface { return useContext(SurfaceContext); }
