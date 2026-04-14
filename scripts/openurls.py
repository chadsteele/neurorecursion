import requests
from html.parser import HTMLParser
import time
import os
from urllib.parse import urlparse
from pathlib import Path

class ImageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.og_image = None
        self.logo_image = None

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)

        # Look for og:image meta tag
        if tag == 'meta' and attrs_dict.get('property') == 'og:image':
            self.og_image = attrs_dict.get('content')

        # Look for img with "logo" in src
        if tag == 'img' and 'logo' in attrs_dict.get('src', '').lower():
            if not self.logo_image:
                self.logo_image = attrs_dict.get('src')

def get_images_from_url(url):
    """Fetch og:image and logo image from a URL"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        response = requests.get(url, timeout=5, headers=headers)
        response.raise_for_status()

        parser = ImageParser()
        parser.feed(response.text)

        return parser.og_image, parser.logo_image
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None, None

def resolve_relative_url(base_url, relative_url):
    """Convert relative URLs to absolute"""
    if not relative_url:
        return None
    if relative_url.startswith('http'):
        return relative_url
    # Simple handling for relative URLs
    from urllib.parse import urljoin
    return urljoin(base_url, relative_url)

def get_domain_from_url(url):
    """Extract domain name from URL (e.g., 'autismspeaks' from 'https://www.autismspeaks.org/')"""
    parsed = urlparse(url)
    domain = parsed.netloc.replace('www.', '').split('.')[0]
    return domain

def download_image(image_url, save_path):
    """Download image from URL and save to file with error recovery"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }

    def get_extension_from_type(content_type, url_path):
        """Helper to determine file extension from content type"""
        content_type_lower = content_type.lower()
        if 'jpeg' in content_type_lower or 'jpg' in url_path:
            return '.jpg'
        elif 'png' in content_type_lower or 'png' in url_path:
            return '.png'
        elif 'webp' in content_type_lower or 'webp' in url_path:
            return '.webp'
        elif 'gif' in content_type_lower or 'gif' in url_path:
            return '.gif'
        else:
            return '.png'

    try:
        # First attempt: normal download
        response = requests.get(image_url, timeout=10, headers=headers)
        response.raise_for_status()

        content_type = response.headers.get('content-type', '')
        url_path = urlparse(image_url).path.lower()
        ext = get_extension_from_type(content_type, url_path)

        final_path = str(save_path).replace('.png', ext)
        with open(final_path, 'wb') as f:
            f.write(response.content)
        return final_path

    except Exception as e:
        # Try to extract media type from error response and retry
        media_type = None

        # Check if exception has a response object with headers
        if hasattr(e, 'response') and e.response is not None:
            media_type = e.response.headers.get('content-type', '')

        if media_type:
            print(f"  ℹ Retrying with media type from error: {media_type}")
            try:
                response = requests.get(image_url, timeout=10, headers=headers)
                url_path = urlparse(image_url).path.lower()
                ext = get_extension_from_type(media_type, url_path)

                final_path = str(save_path).replace('.png', ext)
                with open(final_path, 'wb') as f:
                    f.write(response.content)
                return final_path
            except Exception as retry_error:
                print(f"Error downloading {image_url}: {retry_error}")
                return None
        else:
            print(f"Error downloading {image_url}: {e}")
            return None

urls = [
"https://americanmigrainefoundation.org/",
"https://dyspraxiausa.org/",
"https://findtreatment.gov/",
"https://greatergood.berkeley.edu/",
"https://impostorsyndrome.com/",
"https://internationalculticstudies.org",
"https://ldaamerica.org/what-is-dyscalculia/",
"https://misophonia-hub.org/",
"https://rainn.org/",
"https://suicidepreventionlifeline.org/",
"https://www.aamft.org/",
"https://www.aasect.org/",
"https://www.adaa.org/",
"https://www.addictioncenter.com/",
"https://www.adl.org/",
"https://www.al-anon.org/",
"https://www.anxietycanada.com/",
"https://www.apa.org/",
"https://www.apa.org/aging",
"https://www.apa.org/science/about/psa/perfectionism",
"https://www.apa.org/science/about/psa/test-anxiety",
"https://www.apa.org/topics/anger",
"https://www.asha.org/",
"https://www.bfrb.org/",
"https://www.bipolaruk.org/",
"https://www.campaigntoendloneliness.org/",
"https://www.ceasefirenow.org/",
"https://www.coda.org/",
"https://www.commonsensemedia.org/",
"https://www.coparently.com/",
"https://www.dysgraphia.life/",
"https://www.epilepsy.com/",
"https://www.fearofflying.com/",
"https://www.gunviolencearchive.org/",
"https://www.hospicenet.org/",
"https://www.hrc.org/",
"https://www.iasp-pain.org/",
"https://www.iocdf.org/",
"https://www.mayoclinic.org/",
"https://www.menopause.org/",
"https://www.nationaleatingdisorders.org/",
"https://www.nctsn.org/",
"https://www.nfyi.org/",
"https://www.nia.nih.gov/",
"https://www.postpartumsupport.org/",
"https://www.psychologytoday.com/",
"https://www.ptsd.va.gov/",
"https://www.samhsa.gov/",
"https://www.selectivemutism.org/",
"https://www.sensoryhealth.org/",
"https://www.sleepfoundation.org/",
"https://www.sos-childrensvillages.org/",
"https://www.stepfamilies.info/",
"https://www.stutteringhelp.org/",
"https://www.thehotline.org/",
"https://www.vawnet.org/",
"https://www.zerotothree.org/",
"https://adaa.org/",
"https://chadd.org/",
"https://dyslexiaida.org/",
"https://dyspraxiafoundation.co.uk/",
"https://ibpf.org/",
"https://internationalculticstudies.org/",
"https://iocdf.org/",
"https://sensoryhealth.org/",
"https://tourette.org/",
"https://westutter.org/",
"https://world-gifted.org/",
"https://worldliteracyfoundation.org/",
"https://www.aa.org/",
"https://www.aan.com/",
"https://www.amnesty.org/",
"https://www.autismspeaks.org/",
"https://www.beyondblue.org.au/",
"https://www.brainandspine.org.uk/",
"https://www.dbsalliance.org/",
"https://www.dyscalculia.me.uk/",
"https://www.futureswithoutviolence.org/",
"https://www.gidgetfoundation.org.au/",
"https://www.helpage.org/",
"https://www.hopeandme.org/",
"https://www.hrw.org/",
"https://www.ibro.info/",
"https://www.jaworldwide.org/",
"https://www.joinonelove.org/",
"https://www.mentalhealth.org.uk/",
"https://www.mhanational.org/",
"https://www.mind.org.uk/",
"https://www.msf.org/",
"https://www.na.org/",
"https://www.naacp.org/",
"https://www.nami.org/",
"https://www.neural.org.uk/",
"https://www.pdasociety.org.uk/",
"https://www.thetrevorproject.org/",
"https://www.unhcr.org/",
"https://www.unicef.org/",
"https://www.unodc.org/",
"https://www.wfad.se/",
"https://www.wfmh.global/",
"https://www.wfneurology.org/",
"https://www.who.int/health-topics/mental-health",
"https://www.wpanet.org/"
]

print(f"Processing {len(urls)} URLs and downloading images...\n")

# Create partners directory if it doesn't exist
partners_dir = Path("static/partners")
partners_dir.mkdir(parents=True, exist_ok=True)

saved_count = 0
failed_count = 0
skipped_count = 0

for url in urls:
    domain = get_domain_from_url(url)

    # Check if file already exists with any image extension
    existing_files = list(partners_dir.glob(f"{domain}.*"))
    if existing_files:
        print(f"Skipping: {url} (file already exists: {existing_files[0].name})")
        skipped_count += 1
        continue

    print(f"Processing: {url}")

    # Try to get og:image and logo image
    og_image, logo_image = get_images_from_url(url)

    # Resolve relative URLs to absolute
    og_image = resolve_relative_url(url, og_image)
    logo_image = resolve_relative_url(url, logo_image)

    # Prefer og:image, fallback to logo
    image_url = og_image or logo_image

    if image_url:
        save_path = partners_dir / f"{domain}.png"
        result = download_image(image_url, save_path)

        if result:
            print(f"  ✓ Saved to {result}")
            saved_count += 1
        else:
            print(f"  ✗ Failed to download")
            failed_count += 1
    else:
        print(f"  ✗ No og:image or logo image found")
        failed_count += 1

    # Small delay between requests to be respectful
    time.sleep(0.5)

print(f"\n{'='*60}")
print(f"Complete! Saved {saved_count} images, Skipped {skipped_count}, Failed: {failed_count}")
print(f"Images saved to: {partners_dir.absolute()}")