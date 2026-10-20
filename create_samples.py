from pathlib import Path

# Create thesis draft docx (plain text representation for test)
Path('demo_workspace/Messy_Downloads/thesis_chapter2_rough_draft.docx').write_text(
    'Chapter 2: Literature Review on Edge Inference\n\n'
    'Recent advancements in small language models (SLMs) such as Qwen 2.5 and Llama 3.2 '
    'enable real-time local task execution on consumer-grade hardware without sending '
    'unencrypted telemetry to centralized data centers.\n\n'
    'Key Research Hypothesis: Micro-task planning reduces user anxiety and task abandonment.',
    encoding='utf-8'
)

# Create 1x1 PNG and JPG
png_bytes = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc\xf8\xff\xff?\x00\x05\xfe\x02\xfe\xa76M\xda\x00\x00\x00\x00IEND\xaeB`\x82'
Path('demo_workspace/Messy_Downloads/random_screenshot_bug_error.png').write_bytes(png_bytes)

jpg_bytes = b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' \",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xbf\x00\xff\xd9'
Path('demo_workspace/Messy_Downloads/DSC_0912_beach_vacation.jpg').write_bytes(jpg_bytes)

print('Sample files created successfully!')
