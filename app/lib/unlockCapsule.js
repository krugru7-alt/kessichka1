export async function unlockCapsule(id) {
  try {
    const response = await fetch("/api/capsules", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.ok) {
      throw new Error(data?.error || "Не удалось открыть капсулу");
    }

    const newlyUnlocked = Array.isArray(data.newlyUnlocked)
      ? data.newlyUnlocked
      : [];

    for (const capsuleId of newlyUnlocked) {
      window.dispatchEvent(
        new CustomEvent("our-world-capsule-unlocked", {
          detail: {
            id: capsuleId,
          },
        })
      );
    }

    return data;
  } catch (error) {
    console.error("CAPSULE UNLOCK:", error);
    return null;
  }
}
