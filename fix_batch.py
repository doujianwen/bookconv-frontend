import os

path = r'E:\一人公司\电子书格式转换站\ebook-converter\src\app\api\convert\batch\route.ts'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

modified = False

# Fix 1: Add updateBatch to import (line ~8)
for i, line in enumerate(lines):
    if 'saveBatch, getBatch, deleteBatch, cleanupExpiredBatches' in line and 'batch-store' in line:
        lines[i] = line.replace(
            'saveBatch, getBatch, deleteBatch, cleanupExpiredBatches',
            'saveBatch, getBatch, deleteBatch, updateBatch, cleanupExpiredBatches'
        )
        print(f"Fix 1: Added updateBatch to import at line {i+1}")
        modified = True
        break

# Fix 2: Update return type
for i, line in enumerate(lines):
    if 'Promise<{ success: boolean; bullJobId: string }>' in line:
        lines[i] = line.replace(
            'Promise<{ success: boolean; bullJobId: string }>',
            'Promise<{ success: boolean; bullJobId: string; result?: any }>'
        )
        print(f"Fix 2: Updated return type at line {i+1}")
        modified = True
        break

# Fix 3: Update return statements - need to be careful about context
# Only replace inside queueSingleConversion function (lines ~44-88)
in_queue_func = False
for i, line in enumerate(lines):
    if 'async function queueSingleConversion' in line:
        in_queue_func = True
    if in_queue_func and 'return { success: false, bullJobId };' in line:
        lines[i] = line.replace('return { success: false, bullJobId };', 'return { success: false, bullJobId, result: null };')
        print(f"Fix 3a: Updated return false at line {i+1}")
        modified = True
    if in_queue_func and 'return { success: true, bullJobId };' in line:
        lines[i] = line.replace('return { success: true, bullJobId };', 'return { success: true, bullJobId, result: jobData.returnvalue };')
        print(f"Fix 3b: Updated return true at line {i+1}")
        modified = True
    if in_queue_func and line.strip() == '}':
        # End of function
        in_queue_func = False

# Fix 4: In processBatchAsync, add result persistence before saveBatch
for i, line in enumerate(lines):
    if '// Persist updated batch back to Redis' in line and i > 100:  # Must be in processBatchAsync
        # Insert result persistence between this line and saveBatch
        indent = '        '
        new_lines = [
            f'{indent}// Persist conversion results from queueSingleConversion\n',
            f'{indent}if (result.success && result.result) {{\n',
            f'{indent}  liveItem.result = result.result;\n',
            f'{indent}}}\n',
            f'{indent}// Save batch updates to Redis\n',
            f'{indent}await updateBatch(batchId, (b) => {{\n',
            f'{indent}  b.files[index] = liveItem;\n',
            f'{indent}  b.completedAt = Date.now();\n',
            f'{indent}}});\n',
        ]
        lines[i:i] = new_lines
        print(f"Fix 4: Added result persistence + updateBatch at line {i+1}")
        modified = True
        break

if modified:
    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print(f"\nDone! File now has {len(lines)} lines")
else:
    print("No modifications made!")