import AppKit
import Foundation
import Vision

struct OCRLine: Codable {
    let text: String
    let confidence: Float
    let x: Double
    let y: Double
    let width: Double
    let height: Double
}

struct OCRResult: Codable {
    let path: String
    let lines: [OCRLine]
    let error: String?
}

func imagePaths(from inputs: [String]) -> [String] {
    var paths: [String] = []
    for input in inputs {
        var isDirectory: ObjCBool = false
        guard FileManager.default.fileExists(atPath: input, isDirectory: &isDirectory) else { continue }
        if isDirectory.boolValue {
            guard let enumerator = FileManager.default.enumerator(atPath: input) else { continue }
            for case let relative as String in enumerator where relative.lowercased().hasSuffix(".png") {
                paths.append(URL(fileURLWithPath: input).appendingPathComponent(relative).path)
            }
        } else if input.lowercased().hasSuffix(".png") {
            paths.append(input)
        }
    }
    return paths.sorted()
}

func recognize(path: String, languages: [String]) -> OCRResult {
    let url = URL(fileURLWithPath: path)
    guard let image = NSImage(contentsOf: url),
          let data = image.tiffRepresentation,
          let bitmap = NSBitmapImageRep(data: data),
          let cgImage = bitmap.cgImage else {
        return OCRResult(path: path, lines: [], error: "Unable to load image")
    }

    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.usesLanguageCorrection = true
    request.recognitionLanguages = languages
    do {
        try VNImageRequestHandler(cgImage: cgImage).perform([request])
        let lines = (request.results ?? []).compactMap { observation -> OCRLine? in
            guard let candidate = observation.topCandidates(1).first else { return nil }
            let box = observation.boundingBox
            return OCRLine(text: candidate.string, confidence: candidate.confidence,
                           x: box.origin.x, y: box.origin.y, width: box.size.width, height: box.size.height)
        }.sorted {
            if abs($0.y - $1.y) > 0.01 { return $0.y > $1.y }
            return $0.x < $1.x
        }
        return OCRResult(path: path, lines: lines, error: nil)
    } catch {
        return OCRResult(path: path, lines: [], error: String(describing: error))
    }
}

let encoder = JSONEncoder()
encoder.outputFormatting = [.prettyPrinted, .sortedKeys, .withoutEscapingSlashes]
var arguments = Array(CommandLine.arguments.dropFirst())
var inputs: [String] = []
var languages: [String] = []
var outputPath: String?
var index = 0
while index < arguments.count {
    switch arguments[index] {
    case "--output" where index + 1 < arguments.count:
        outputPath = arguments[index + 1]
        index += 2
    case "--recognition-language" where index + 1 < arguments.count:
        languages.append(arguments[index + 1])
        index += 2
    default:
        inputs.append(arguments[index])
        index += 1
    }
}
if languages.isEmpty { languages = ["en-US"] }
let results = imagePaths(from: inputs).map { recognize(path: $0, languages: languages) }
guard let data = try? encoder.encode(results) else { exit(1) }
if let outputPath {
    do {
        try data.write(to: URL(fileURLWithPath: outputPath), options: .atomic)
    } catch {
        FileHandle.standardError.write(Data("Unable to write OCR output: \(error)\n".utf8))
        exit(1)
    }
} else if let output = String(data: data, encoding: .utf8) {
    print(output)
}
