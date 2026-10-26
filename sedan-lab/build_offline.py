"""Create an offline, double-clickable HTML from the exact app sources."""
from pathlib import Path
import re

root = Path(__file__).resolve().parent
dist = root / "dist"
html = (dist / "index.html").read_text()
css = (dist / "style.css").read_text()
css = re.sub(r"@import url\(.*?\);\s*", "", css, flags=re.DOTALL)
html = html.replace('<link rel="stylesheet" href="style.css">', '<style>' + css + '</style>')
for name in ['vendor/three.min.js', 'vendor/RGBELoader.js', 'vendor/RoundedBoxGeometry.js', 'vendor/hdr-data.js', 'catalog.js', 'studio.js', 'model.js', 'app.js']:
    code = (dist / name).read_text().replace('</script', r'<\/script')
    html = html.replace(f'<script src="{name}"></script>', '<script>\n' + code + '\n</script>')
notices = []
for title, path in [
    ('OpenCar3D MIT license', root.parent / 'LICENSE'),
    ('Third-party notices', root.parent / 'THIRD_PARTY_NOTICES.md'),
    ('Three.js MIT license', dist / 'vendor/THREE-LICENSE.txt'),
    ('Studio Small 08 HDRI — CC0 1.0', dist / 'vendor/CC0-1.0.txt'),
]:
    notices.append(title + '\n\n' + path.read_text())
license_text = '\n\n'.join(notices).replace('--', '—')
html = html.replace('</head>', '<!--\n' + license_text + '\n-->\n</head>')
output = root.parent / 'sedan-lab-anatomia.html'
output.write_text(html)
print(f'Offline HTML: {output} ({output.stat().st_size:,} bytes)')
