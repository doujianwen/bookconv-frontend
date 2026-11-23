// Unit tests for the force-push argument guard (P2/P2-A round2).
import { classifyPushArgs, resolvePushTarget } from "../../scripts/force-push-guard.mjs";

describe("classifyPushArgs — destructive force push detection", () => {
  describe("BLOCKS all force-equivalent forms", () => {
    it.each([
      ["--force", "origin main"],
      ["-f", "origin main"],
      ["--force-with-lease", "origin main"],
      ["--force-if-includes", "origin main"],
      ["--delete", "origin old-branch"],
      ["+main:main", "explicit forced refspec"],
      [":refs/heads/main", "delete refspec"],
      ["--receive-pack=evil", "custom receive-pack"],
      ["-fu", "combined short flag containing f"],
      // Round2 P2-A: '=' forms + bare '+' refspec + mirror (round1 bypasses).
      ["--force=true", "force with =value"],
      ["--force-with-lease=main", "lease with =value"],
      ["--force-if-includes=true", "if-includes with =value"],
      ["+main", "bare forced refspec without colon"],
      ["+HEAD:main", "forced HEAD refspec"],
      ["--mirror", "mirror push force-updates all refs"],
    ])("blocks %s (%s)", (flag) => {
      const v = classifyPushArgs(["origin", "main", flag as string]);
      expect(v.allowed).toBe(false);
      expect(v.reason).toBeTruthy();
      expect(v.matched).toBe(flag);
    });
  });

  describe("ALLOWS normal fast-forward push args", () => {
    it.each([
      ["origin main"],
      ["git@github-old:doujianwen/bookconv-frontend.git main"],
      ["origin", "main"],
      ["--set-upstream", "origin", "main"],
      ["origin", "HEAD:refs/heads/main"],
    ])("allows %s", (...args) => {
      const v = classifyPushArgs(args as string[]);
      expect(v.allowed).toBe(true);
      expect(v.reason).toBe("OK");
    });
  });

  it("negative control: a branch name containing 'f' is not a force flag", () => {
    expect(classifyPushArgs(["origin", "feature"]).allowed).toBe(true);
    expect(classifyPushArgs(["origin", "refs/heads/fix"]).allowed).toBe(true);
  });

  it("Round2: new force forms are classified with distinct reasons", () => {
    expect(classifyPushArgs(["--force=true"]).reason).toBe("FORCE_FLAG_VALUE");
    expect(classifyPushArgs(["+main"]).reason).toBe("FORCE_REFSPEC");
    expect(classifyPushArgs(["--mirror"]).reason).toBe("MIRROR_PUSH");
  });

  it("Round2: a plain '+' inside a ref name (not leading) is still allowed", () => {
    // only LEADING '+' is a forced refspec; 'feature+2' is a normal branch name
    expect(classifyPushArgs(["origin", "feature+2"]).allowed).toBe(true);
  });

  it("empty args are allowed (caller still runs real push; guard only checks flags)", () => {
    expect(classifyPushArgs([]).allowed).toBe(true);
  });
});

describe("resolvePushTarget — derive FF-check ref from actual push args (round2)", () => {
  it("parses `origin main`", () => {
    expect(resolvePushTarget(["origin", "main"])).toEqual({
      remoteName: "origin", remoteRef: "origin/main", localRef: "main",
    });
  });
  it("parses `origin main:main`", () => {
    expect(resolvePushTarget(["origin", "main:main"])).toEqual({
      remoteName: "origin", remoteRef: "origin/main", localRef: "main",
    });
  });
  it("parses `origin HEAD:refs/heads/main`", () => {
    expect(resolvePushTarget(["origin", "HEAD:refs/heads/main"])).toEqual({
      remoteName: "origin", remoteRef: "origin/main", localRef: "HEAD",
    });
  });
  it("supports a remote URL as the remote name", () => {
    expect(resolvePushTarget(["git@github-old:repo.git", "main"])?.remoteRef).toBe("git@github-old:repo.git/main");
  });
  it("returns null (fail closed) when target is ambiguous", () => {
    expect(resolvePushTarget(["origin"])).toBeNull();
    expect(resolvePushTarget([])).toBeNull();
  });
});
