import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Get the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "AIzaSyC-Fu7YLYFTohz1pcPwtAAT7M-7nkfzD0A");

// Helper function to convert a File to Google's GenerativePart format
async function fileToGenerativePart(file: File): Promise<Part> {
    const base64EncodedData = Buffer.from(await file.arrayBuffer()).toString(
        "base64",
    );
    return {
        inlineData: {
            data: base64EncodedData,
            mimeType: file.type,
        },
    };
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("image") as File;

        if (!file) {
            return NextResponse.json({ error: "No image file provided." }, { status: 400 });
        }

        // Use the "Nano Banana" model
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-image",
        });

        const imagePart = await fileToGenerativePart(file);

        // This is your prompt!
        const promptParts = [
            "Extract the main product from this image and place it on a solid, clean white background. Ensure the output image has the same dimensions as the original.",
            imagePart,
        ];

        // Call the AI model
        // FIX 1: Pass the array directly, not an object { parts: ... }
        const result = await model.generateContent(promptParts);
        const response = result.response;

        // Type guards to narrow SDK union types safely
        const hasInlineData = (p: unknown): p is { inlineData: { data: string; mimeType: string } } => {
            return !!p && typeof p === "object" && "inlineData" in p && !!(p as any).inlineData &&
                typeof (p as any).inlineData.data === "string" && typeof (p as any).inlineData.mimeType === "string";
        };
        const hasText = (p: unknown): p is { text: string } => {
            return !!p && typeof p === "object" && typeof (p as any).text === "string";
        };

        // Refined handling of first returned part
        const firstPart = response.candidates?.[0]?.content?.parts?.[0];

        if (hasInlineData(firstPart)) {
            // SUCCESS: It's an image
            return NextResponse.json({
                base64: firstPart.inlineData.data,
                mimeType: firstPart.inlineData.mimeType,
            });
        } else if (hasText(firstPart)) {
            // FAILURE: The AI returned text instead (e.g., an error)
            return NextResponse.json(
                { error: "AI returned text instead of an image.", details: firstPart.text },
                { status: 500 },
            );
        }

        // FAILURE: No response part found or safety block
        return NextResponse.json(
            {
                error: "Failed to process image.",
                details: "No content returned from AI. This may be due to safety filters.",
                finishReason: response.candidates?.[0]?.finishReason,
                safetyRatings: response.candidates?.[0]?.safetyRatings,
            },
            { status: 500 },
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Internal server error.", details: (error as Error).message },
            { status: 500 },
        );
    }
}
