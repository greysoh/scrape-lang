export async function exists(file) {
  try {
    await Deno.stat(file);
    return true;
  } catch (e) {
    return false;
  }
}

export function existsSync(file) {
  try {
    Deno.statSync(file);
    return true;
  } catch (e) {
    return false;
  }
}
