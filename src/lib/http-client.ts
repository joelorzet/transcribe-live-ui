export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export class HttpClient {
  constructor(private readonly resolveBaseUrl: () => string) {}

  get baseUrl(): string {
    return this.resolveBaseUrl();
  }

  buildUrl(path: string, params?: Record<string, string>): string {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return `${this.baseUrl}${path}${query}`;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path);
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, { method: "POST", body: JSON.stringify(body) });
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, { method: "PUT", body: JSON.stringify(body) });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: { "content-type": "application/json" },
      ...init,
    });

    if (!response.ok) {
      throw new ApiError(await HttpClient.readErrorMessage(response), response.status);
    }

    return (await response.json()) as T;
  }

  private static async readErrorMessage(response: Response): Promise<string> {
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) return body.message;
    } catch {
      /* body was not JSON */
    }
    return `${response.status} ${response.statusText}`;
  }
}
