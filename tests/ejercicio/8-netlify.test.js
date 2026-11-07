const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

describe('Ejercicio 8: Publicación en Netlify', () => {
  let myPageData, siteHtml;
  const myPagePath = path.join(__dirname, '../../my-page.js');

  const fetchUrl = (url) => {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      const timeout = 10000;

      const req = protocol.get(url, { timeout }, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, data, headers: res.headers });
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  };

  const loadMyPageData = () => {
    try {
      const fileContent = fs.readFileSync(myPagePath, 'utf-8');
      const dataMatch = fileContent.match(/data\s*=\s*({[\s\S]*?})/);
      if (dataMatch) {
        return eval(`(${dataMatch[1]})`);
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  describe('Archivo my-page.js', () => {
    beforeAll(() => {
      myPageData = loadMyPageData();
    });

    test('Debe existir el archivo my-page.js', () => {
      expect(fs.existsSync(myPagePath)).toBeTruthy();
    });

    test('El archivo debe contener datos válidos', () => {
      expect(myPageData).toBeTruthy();
      expect(myPageData).toHaveProperty('name');
      expect(myPageData).toHaveProperty('matricula');
      expect(myPageData).toHaveProperty('url');
    });

    test('El campo "name" debe contener un nombre completo válido', () => {
      expect(myPageData).toBeTruthy();
      expect(myPageData.name).toBeTruthy();
      expect(myPageData.name.length).toBeGreaterThan(5);
      expect(myPageData.name).not.toMatch(/Nombre completo del estudiante/i);
      const words = myPageData.name.trim().split(/\s+/);
      expect(words.length).toBeGreaterThanOrEqual(2);
    });

    test('El campo "matricula" debe ser válido', () => {
      expect(myPageData).toBeTruthy();
      expect(myPageData.matricula).toBeTruthy();
      expect(myPageData.matricula.toString().length).toBeGreaterThan(4);
      expect(myPageData.matricula).not.toMatch(/Su matrícula sin guiones/i);
      expect(myPageData.matricula).not.toMatch(/matrícula/i);
      expect(myPageData.matricula.toString()).not.toMatch(/-/);
    });

    test('El campo "url" debe tener formato válido de Netlify', () => {
      expect(myPageData).toBeTruthy();
      expect(myPageData.url).toBeTruthy();
      const urlPattern = /^https?:\/\/.+/;
      expect(urlPattern.test(myPageData.url)).toBeTruthy();
      expect(myPageData.url).not.toMatch(/su-url-personal/i);
    });

    test('La URL debe terminar con /', () => {
      expect(myPageData).toBeTruthy();
      expect(myPageData.url).toBeTruthy();
      expect(myPageData.url.endsWith('/')).toBeTruthy();
    });
  });

  describe('Accesibilidad del Sitio', () => {
    let fetchResponse;

    beforeAll(async () => {
      myPageData = loadMyPageData();
      if (myPageData && myPageData.url) {
        let url = myPageData.url;
        if (!url.endsWith('/')) {
          url += '/';
        }
        try {
          fetchResponse = await fetchUrl(url);
          siteHtml = fetchResponse.data;
        } catch (error) {
          siteHtml = '';
        }
      }
    }, 30000);

    test('El sitio debe ser accesible (código 200)', async () => {
      expect(myPageData).toBeTruthy();
      expect(myPageData.url).toBeTruthy();
      expect(fetchResponse).toBeTruthy();
      expect(fetchResponse.statusCode).toBe(200);
    }, 15000);

    test('El sitio debe retornar contenido HTML', async () => {
      expect(fetchResponse).toBeTruthy();
      expect(fetchResponse.headers['content-type']).toMatch(/text\/html/);
    }, 15000);
  });

  describe('Contenido del Sitio Publicado', () => {
    beforeAll(() => {
      expect(siteHtml).toBeTruthy();
    });

    test('El HTML debe tener un título apropiado', () => {
      const titleMatch = siteHtml.match(/<title>(.*?)<\/title>/i);
      expect(titleMatch).toBeTruthy();
      const title = titleMatch[1];
      const hasRelevantTitle = /ejercicio|api|tienda|store/i.test(title);
      expect(hasRelevantTitle).toBeTruthy();
    });

    test('El HTML debe incluir Bootstrap 5', () => {
      const hasBootstrap = /bootstrap@5|bootstrap\/5|bootstrap\.min\.css/i.test(siteHtml);
      expect(hasBootstrap).toBeTruthy();
    });

    test('El HTML debe tener el elemento con id="ofertas"', () => {
      const hasOfertas = /id\s*=\s*["']ofertas["']/i.test(siteHtml);
      expect(hasOfertas).toBeTruthy();
    });

    test('El HTML debe tener el elemento con id="carrusel" o "carousel"', () => {
      const hasCarrusel = /id\s*=\s*["']carr(?:u|o)sel["']/i.test(siteHtml);
      expect(hasCarrusel).toBeTruthy();
    });

    test('El HTML debe tener el elemento con id="catalogo"', () => {
      const hasCatalogo = /id\s*=\s*["']catalogo["']/i.test(siteHtml);
      expect(hasCatalogo).toBeTruthy();
    });

    test('El HTML debe tener un modal de Bootstrap', () => {
      const hasModal = /class\s*=\s*["'][^"']*\bmodal\b[^"']*["']/i.test(siteHtml);
      expect(hasModal).toBeTruthy();
    });

    test('El HTML debe tener un navbar', () => {
      const hasNavbar = /class\s*=\s*["'][^"']*\bnavbar\b[^"']*["']|<nav/i.test(siteHtml);
      expect(hasNavbar).toBeTruthy();
    });

    test('El HTML debe incluir el archivo JavaScript', () => {
      const hasJS = /src\s*=\s*["'][^"']*api-store\.js["']|src\s*=\s*["'][^"']*js\/api-store\.js["']/i.test(siteHtml);
      expect(hasJS).toBeTruthy();
    });
  });

  describe('Estructura del Proyecto Local', () => {
    test('Debe existir index.html en src/', () => {
      const indexPath = path.join(__dirname, '../../src/index.html');
      expect(fs.existsSync(indexPath)).toBeTruthy();
    });

    test('Debe existir api-store.js en src/js/', () => {
      const jsPath = path.join(__dirname, '../../src/js/api-store.js');
      expect(fs.existsSync(jsPath)).toBeTruthy();
    });

    test('La carpeta src debe existir', () => {
      const srcPath = path.join(__dirname, '../../src');
      expect(fs.existsSync(srcPath)).toBeTruthy();
    });
  });

  describe('Verificación Final', () => {
    test('Todos los archivos necesarios están presentes', () => {
      const requiredFiles = [
        path.join(__dirname, '../../my-page.js'),
        path.join(__dirname, '../../src/index.html'),
        path.join(__dirname, '../../src/js/api-store.js')
      ];
      const allExist = requiredFiles.every(file => fs.existsSync(file));
      expect(allExist).toBeTruthy();
    });

    test('Los datos en my-page.js son válidos y el sitio es accesible', async () => {
      myPageData = loadMyPageData();
      expect(myPageData).toBeTruthy();
      expect(myPageData.url).toBeTruthy();
      
      expect(myPageData.name).not.toMatch(/Nombre completo del estudiante/i);
      expect(myPageData.matricula).not.toMatch(/Su matrícula sin guiones/i);
      expect(myPageData.url).not.toMatch(/su-url-personal/i);

      const response = await fetchUrl(myPageData.url);
      expect(response.statusCode).toBe(200);
      expect(response.data.length).toBeGreaterThan(0);
    }, 15000);
  });
});