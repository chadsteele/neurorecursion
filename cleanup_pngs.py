import os

files_to_delete = [
    'static/logo.blue.png',
    'static/logo.blue.shadows copy.png',
    'static/logo.brush.png',
    'static/logo.institute.png',
    'static/logo.berkeley.shadows.png',
    'static/logo.berkeley.dark.shadows.png',
    'static/logo copy.png',
    'static/whitespot.png',
    'static/backgrounds/neural.png',
    'static/backgrounds/attached.png',
    'static/backgrounds/children-playing-grass_1098-504.png',
    'static/backgrounds/group-diverse-kids-playing-field-together_53876-78365.png',
    'static/backgrounds/istockphoto-998670532-612x612.png',
    'static/backgrounds/sharma-obesity-kids-playing-outside.png',
    'static/backgrounds/smiling-kids-playing-with-multi-colored-toy-blocks-generated-by-ai-free-photo.png',
    'static/partners/soquiet.png',
    'static/partners/ldaa.png',
    'static/partners/britishdyslexia.png',
    'static/partners/autismeurope.png',
    'static/partners/cpi-primary-logo.png',
    'static/partners/nas.png'
]

deleted = 0
failed = 0
for f in files_to_delete:
    try:
        os.remove(f)
        deleted += 1
        print(f'Deleted: {f}')
    except FileNotFoundError:
        failed += 1
    except Exception as e:
        print(f'Error: {f} - {e}')
        failed += 1

print(f'\n✓ Total deleted: {deleted}')
print(f'✗ Failed/not found: {failed}')
