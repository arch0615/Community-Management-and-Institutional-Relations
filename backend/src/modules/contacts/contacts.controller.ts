import { Request, Response, NextFunction } from "express";
import { ContactsService } from "./contacts.service";
import csvParser from "csv-parser";
import { Readable } from "stream";

const contactsService = new ContactsService();

export class ContactsController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await contactsService.findAll(
        req.user!.organizationId,
        req.query as unknown as Record<string, string>
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const contact = await contactsService.findById(req.params.id as string, req.user!.organizationId);
      res.json(contact);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const contact = await contactsService.create(req.user!.organizationId, req.body);
      res.status(201).json(contact);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const contact = await contactsService.update(
        req.params.id as string,
        req.user!.organizationId,
        req.body
      );
      res.json(contact);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await contactsService.delete(req.params.id as string, req.user!.organizationId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async addTag(req: Request, res: Response, next: NextFunction) {
    try {
      await contactsService.addTag(req.params.id as string, req.body.tagId, req.user!.organizationId);
      res.json({ message: "Tag added" });
    } catch (error) {
      next(error);
    }
  }

  async removeTag(req: Request, res: Response, next: NextFunction) {
    try {
      await contactsService.removeTag(req.params.id as string, req.params.tagId as string, req.user!.organizationId);
      res.json({ message: "Tag removed" });
    } catch (error) {
      next(error);
    }
  }

  async addInteraction(req: Request, res: Response, next: NextFunction) {
    try {
      const interaction = await contactsService.addInteraction(
        req.params.id as string,
        req.user!.organizationId,
        req.body
      );
      res.status(201).json(interaction);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await contactsService.getStats(req.user!.organizationId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async exportCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const rows = await contactsService.exportContacts(req.user!.organizationId);

      if (rows.length === 0) {
        res.status(200).json({ message: "No hay contactos para exportar" });
        return;
      }

      const headers = Object.keys(rows[0]);
      const csvLines = [
        headers.join(","),
        ...rows.map((row) =>
          headers.map((h) => {
            const val = String((row as any)[h] || "").replace(/"/g, '""');
            return val.includes(",") || val.includes('"') || val.includes("\n") ? `"${val}"` : val;
          }).join(",")
        ),
      ];

      const csv = csvLines.join("\n");
      const date = new Date().toISOString().slice(0, 10);

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename=contactos_${date}.csv`);
      res.send("\uFEFF" + csv); // BOM for Excel UTF-8
    } catch (error) {
      next(error);
    }
  }

  async importCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: "No se proporcionó archivo CSV" });
        return;
      }

      const rows: any[] = [];

      await new Promise<void>((resolve, reject) => {
        const stream = Readable.from(file.buffer);
        stream
          .pipe(csvParser())
          .on("data", (row) => rows.push(row))
          .on("end", resolve)
          .on("error", reject);
      });

      if (rows.length === 0) {
        res.status(400).json({ error: "El archivo CSV está vacío" });
        return;
      }

      const result = await contactsService.importContacts(req.user!.organizationId, rows);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
