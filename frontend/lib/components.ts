export type ComponentCategory =
  | "client"
  | "traffic"
  | "compute"
  | "storage"
  | "cache"
  | "messaging"
  | "other";

export type NodeVariant = "input" | "default" | "output";

export type ConfigFieldType = "number" | "text" | "select" | "boolean";

export interface ConfigField {
  key: string;
  label: string;
  type: ConfigFieldType;
  options?: string[];
  default: string | number | boolean;
  min?: number;
  max?: number;
}

export interface ComponentDefinition {
  id: string;
  label: string;
  category: ComponentCategory;
  variant: NodeVariant;
  icon: string;
  accent: string;
  configFields: ConfigField[];
}

export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  client: "Clients",
  traffic: "Traffic & Edge",
  compute: "Compute",
  storage: "Storage",
  cache: "Cache",
  messaging: "Messaging",
  other: "Other",
};

const replicas: ConfigField = {
  key: "replicas",
  label: "Replicas",
  type: "number",
  default: 1,
  min: 1,
  max: 100,
};

const sharding: ConfigField = {
  key: "sharding",
  label: "Sharding",
  type: "select",
  options: ["none", "horizontal", "vertical"],
  default: "none",
};

export const COMPONENT_CATALOG: ComponentDefinition[] = [
  {
    id: "web_client",
    label: "Web Client",
    category: "client",
    variant: "input",
    icon: "🌐",
    accent: "emerald",
    configFields: [],
  },
  {
    id: "mobile_client",
    label: "Mobile App",
    category: "client",
    variant: "input",
    icon: "📱",
    accent: "emerald",
    configFields: [],
  },
  {
    id: "load_balancer",
    label: "Load Balancer",
    category: "traffic",
    variant: "default",
    icon: "⚖️",
    accent: "sky",
    configFields: [replicas, { key: "algorithm", label: "Algorithm", type: "select", options: ["round_robin", "least_connections", "ip_hash"], default: "round_robin" }],
  },
  {
    id: "api_gateway",
    label: "API Gateway",
    category: "traffic",
    variant: "default",
    icon: "🚪",
    accent: "sky",
    configFields: [replicas, { key: "rate_limit", label: "Rate Limit (req/s)", type: "number", default: 1000, min: 1 }],
  },
  {
    id: "cdn",
    label: "CDN",
    category: "traffic",
    variant: "default",
    icon: "🌍",
    accent: "sky",
    configFields: [{ key: "edge_locations", label: "Edge Locations", type: "number", default: 10, min: 1 }],
  },
  {
    id: "app_server",
    label: "App Server",
    category: "compute",
    variant: "default",
    icon: "🖥️",
    accent: "violet",
    configFields: [replicas, { key: "instance_type", label: "Instance Type", type: "select", options: ["small", "medium", "large"], default: "medium" }],
  },
  {
    id: "microservice",
    label: "Microservice",
    category: "compute",
    variant: "default",
    icon: "🧩",
    accent: "violet",
    configFields: [replicas, { key: "language", label: "Runtime", type: "text", default: "Go" }],
  },
  {
    id: "serverless",
    label: "Serverless",
    category: "compute",
    variant: "default",
    icon: "λ",
    accent: "violet",
    configFields: [{ key: "memory_mb", label: "Memory (MB)", type: "number", default: 512, min: 128 }],
  },
  {
    id: "sql_database",
    label: "SQL Database",
    category: "storage",
    variant: "default",
    icon: "🗄️",
    accent: "amber",
    configFields: [replicas, sharding, { key: "read_replicas", label: "Read Replicas", type: "number", default: 0, min: 0 }],
  },
  {
    id: "nosql_database",
    label: "NoSQL Database",
    category: "storage",
    variant: "default",
    icon: "📦",
    accent: "amber",
    configFields: [sharding, { key: "consistency", label: "Consistency", type: "select", options: ["strong", "eventual"], default: "eventual" }],
  },
  {
    id: "blob_storage",
    label: "Blob Storage",
    category: "storage",
    variant: "default",
    icon: "💾",
    accent: "amber",
    configFields: [{ key: "durability", label: "Durability", type: "select", options: ["99.9%", "99.99%", "99.999%"], default: "99.99%" }],
  },
  {
    id: "search_index",
    label: "Search Index",
    category: "storage",
    variant: "default",
    icon: "🔍",
    accent: "amber",
    configFields: [replicas],
  },
  {
    id: "redis",
    label: "Redis Cache",
    category: "cache",
    variant: "default",
    icon: "⚡",
    accent: "rose",
    configFields: [{ key: "ttl_seconds", label: "TTL (seconds)", type: "number", default: 3600, min: 0 }, { key: "eviction", label: "Eviction", type: "select", options: ["lru", "lfu", "ttl"], default: "lru" }],
  },
  {
    id: "memcached",
    label: "Memcached",
    category: "cache",
    variant: "default",
    icon: "💨",
    accent: "rose",
    configFields: [{ key: "memory_mb", label: "Memory (MB)", type: "number", default: 1024, min: 64 }],
  },
  {
    id: "message_queue",
    label: "Message Queue",
    category: "messaging",
    variant: "default",
    icon: "📨",
    accent: "cyan",
    configFields: [{ key: "partitions", label: "Partitions", type: "number", default: 3, min: 1 }],
  },
  {
    id: "pub_sub",
    label: "Pub/Sub",
    category: "messaging",
    variant: "default",
    icon: "📡",
    accent: "cyan",
    configFields: [{ key: "topics", label: "Topics", type: "number", default: 1, min: 1 }],
  },
  {
    id: "rate_limiter",
    label: "Rate Limiter",
    category: "other",
    variant: "default",
    icon: "🛑",
    accent: "zinc",
    configFields: [{ key: "limit_per_second", label: "Limit (req/s)", type: "number", default: 100, min: 1 }],
  },
  {
    id: "auth_service",
    label: "Auth Service",
    category: "other",
    variant: "default",
    icon: "🔐",
    accent: "zinc",
    configFields: [{ key: "provider", label: "Provider", type: "select", options: ["jwt", "oauth2", "saml"], default: "jwt" }],
  },
  {
    id: "analytics",
    label: "Analytics",
    category: "other",
    variant: "output",
    icon: "📊",
    accent: "zinc",
    configFields: [],
  },
];

export function getComponent(id: string): ComponentDefinition | undefined {
  return COMPONENT_CATALOG.find((c) => c.id === id);
}

export function defaultConfig(component: ComponentDefinition): Record<string, string | number | boolean> {
  return Object.fromEntries(component.configFields.map((f) => [f.key, f.default]));
}

export function componentsByCategory(): Record<ComponentCategory, ComponentDefinition[]> {
  const grouped = {} as Record<ComponentCategory, ComponentDefinition[]>;
  for (const cat of Object.keys(CATEGORY_LABELS) as ComponentCategory[]) {
    grouped[cat] = COMPONENT_CATALOG.filter((c) => c.category === cat);
  }
  return grouped;
}
