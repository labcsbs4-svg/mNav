const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;

// Locations
app.get('/api/locations', async (req: any, res: any) => {
  const items = await prisma.location.findMany({ orderBy: { createdAt: 'asc' } });
  res.json(items);
});

app.post('/api/locations', async (req: any, res: any) => {
  const { name, description, lat, lng, category } = req.body;
  const created = await prisma.location.create({ data: { name, description, lat, lng, category } });
  res.json(created);
});

app.delete('/api/locations/:id', async (req: any, res: any) => {
  const { id } = req.params;
  await prisma.location.delete({ where: { id } });
  res.status(204).send();
});

// Roads
app.get('/api/roads', async (req: any, res: any) => {
  const items = await prisma.road.findMany({ orderBy: { createdAt: 'asc' } });
  // parse coordinates
  const parsed = items.map((r: any) => ({ ...r, coordinates: JSON.parse(r.coordinates) }));
  res.json(parsed);
});

app.post('/api/roads', async (req: any, res: any) => {
  const { name, type, coordinates } = req.body;
  const created = await prisma.road.create({ data: { name, type, coordinates: JSON.stringify(coordinates) } });
  res.json({ ...created, coordinates });
});

app.delete('/api/roads/:id', async (req: any, res: any) => {
  const { id } = req.params;
  await prisma.road.delete({ where: { id } });
  res.status(204).send();
});

// Events
app.get('/api/events', async (req: any, res: any) => {
  const items = await prisma.event.findMany({ orderBy: { createdAt: 'asc' } });
  // parse tags
  const parsed = items.map((e: any) => ({ ...e, tags: JSON.parse(e.tags) }));
  res.json(parsed);
});

app.post('/api/events', async (req: any, res: any) => {
  const { name, description, date, time, venue, category, organizer, registrationRequired, capacity, tags } = req.body;
  const created = await prisma.event.create({ 
    data: { 
      name, 
      description, 
      date, 
      time, 
      venue, 
      category, 
      organizer, 
      registrationRequired, 
      capacity: capacity || 0, 
      registeredCount: 0,
      tags: JSON.stringify(tags || [])
    } 
  });
  res.json({ ...created, tags });
});

app.put('/api/events/:id', async (req: any, res: any) => {
  const { id } = req.params;
  const { name, description, date, time, venue, category, organizer, registrationRequired, capacity, tags, registeredCount } = req.body;
  const updated = await prisma.event.update({ 
    where: { id },
    data: { 
      name, 
      description, 
      date, 
      time, 
      venue, 
      category, 
      organizer, 
      registrationRequired, 
      capacity, 
      registeredCount,
      tags: JSON.stringify(tags) 
    } 
  });
  res.json({ ...updated, tags });
});

app.delete('/api/events/:id', async (req: any, res: any) => {
  const { id } = req.params;
  await prisma.event.delete({ where: { id } });
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
