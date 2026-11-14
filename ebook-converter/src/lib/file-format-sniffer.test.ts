import { File } from "node:buffer";
import { sniffFileFormat } from "./file-format-sniffer";

function palmDb(signature: string): File {
  const bytes = Buffer.alloc(96);
  bytes.write("BookConv Test", 0, "ascii");
  bytes.write(signature, 60, "ascii");
  return new File([bytes], "sample.azw3");
}

describe("sniffFileFormat MOBI/AZW3 PalmDB headers", () => {
  it("accepts a normal BOOKMOBI PalmDB header as AZW3", async () => {
    await expect(sniffFileFormat(palmDb("BOOKMOBI"), "azw3")).resolves.toBeNull();
  });

  it("accepts a normal BOOKMOBI PalmDB header as MOBI", async () => {
    await expect(sniffFileFormat(palmDb("BOOKMOBI"), "mobi")).resolves.toBeNull();
  });

  it("does not misclassify the Topaz TPZ3 marker as AZW3", async () => {
    const result = await sniffFileFormat(palmDb("TPZ3____"), "azw3");
    expect(result).not.toBeNull();
    expect(result?.magicHex).toBe("426f6f6b");
  });
});
