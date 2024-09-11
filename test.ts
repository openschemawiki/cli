import * as tar from "tar"

const zipped = tar.c({
	gzip: false
}, ["./MedicalRecord"])
// Retrieve the buffer without writing to disk
const buffer = await new Promise<Buffer>((resolve, reject) => {
	const chunks: Buffer[] = []
	zipped.on("data", (chunk) => chunks.push(chunk))
	zipped.on("end", () => resolve(Buffer.concat(chunks)))
	zipped.on("error", reject)
})

const body = new FormData()
body.set("file", new Blob([buffer]))
body.set("schema", "MedicalRecord")
body.set("version", "")

const response = await fetch("http://localhost:3000/api/upload", {
	method: "POST",
	body
})

console.log(await response.text());
