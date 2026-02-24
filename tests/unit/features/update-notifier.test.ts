import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkForUpdates } from "@/features/update-notifier";

const mockNotify = vi.fn();
const mockCheck = vi.fn();

let mockUpdate: {
  latest: string;
  current: string;
  type: string;
  name: string;
} | null = null;

vi.mock("update-notifier", () => ({
  default: vi.fn(() => ({
    check: mockCheck,
    get update() {
      return mockUpdate;
    },
    notify: mockNotify,
  })),
}));

describe("checkForUpdates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdate = null;
  });

  it("should call notify when update is available", async () => {
    mockUpdate = {
      latest: "2.0.0",
      current: "1.0.1",
      type: "minor",
      name: "create-skeleton-next",
    };

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await checkForUpdates();

    expect(mockCheck).toHaveBeenCalledTimes(1);
    expect(mockNotify).toHaveBeenCalledTimes(1);
    const notifyOptions = mockNotify.mock.calls?.[0]?.[0];
    expect(notifyOptions).toMatchObject({
      defer: false,
      isGlobal: true,
    });
    expect(notifyOptions.message).toContain("1.0.1");
    expect(notifyOptions.message).toContain("2.0.0");
    expect(notifyOptions.message).toContain(
      "pnpm install -g create-skeleton-next",
    );
    expect(notifyOptions.message).toContain("Update available");

    consoleSpy.mockRestore();
  });

  it("should not call notify when current equals latest", async () => {
    mockUpdate = {
      latest: "1.0.1",
      current: "1.0.1",
      type: "latest",
      name: "create-skeleton-next",
    };

    await checkForUpdates();

    expect(mockNotify).not.toHaveBeenCalled();
  });

  it("should not call notify when current is greater than latest", async () => {
    mockUpdate = {
      latest: "1.0.0",
      current: "1.0.1",
      type: "patch",
      name: "create-skeleton-next",
    };

    await checkForUpdates();

    expect(mockNotify).not.toHaveBeenCalled();
  });

  it("should not call notify when update is null", async () => {
    mockUpdate = null;

    await checkForUpdates();

    expect(mockNotify).not.toHaveBeenCalled();
  });

  it("should pass boxenOptions to notify", async () => {
    mockUpdate = {
      latest: "1.1.0",
      current: "1.0.1",
      type: "minor",
      name: "create-skeleton-next",
    };

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await checkForUpdates();

    expect(mockNotify).toHaveBeenCalledWith(
      expect.objectContaining({
        boxenOptions: {
          borderColor: "yellow",
          borderStyle: "round",
          padding: 1,
          margin: 1,
        },
      }),
    );

    consoleSpy.mockRestore();
  });
});
