"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = exports.getMyProfile = exports.updateProfile = exports.createProfile = void 0;
const prisma_1 = require("../lib/prisma");
const schemas_1 = require("../schemas");
const zod_1 = require("zod");
function normalizeWhatsapp(whatsapp) {
    if (!whatsapp)
        return null;
    const cleaned = whatsapp.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
        return '62' + cleaned.slice(1);
    }
    return cleaned;
}
function isValidWhatsapp(whatsapp) {
    return /^62\d{9,13}$/.test(whatsapp);
}
const createProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const { name, bio, location, whatsapp, skills } = schemas_1.updateProfileSchema
            .extend({ name: zod_1.z.string().min(1, 'Name is required') })
            .parse(req.body);
        // Check if profile already exists
        const existingProfile = await prisma_1.prisma.profile.findUnique({
            where: { userId },
        });
        if (existingProfile) {
            res.status(409).json({
                success: false,
                message: 'Profile already exists. Use PUT /profile.',
            });
            return;
        }
        const normalizedWhatsapp = normalizeWhatsapp(whatsapp);
        if (normalizedWhatsapp && !isValidWhatsapp(normalizedWhatsapp)) {
            res.status(400).json({
                success: false,
                message: 'Invalid WhatsApp number. Example: 6281234567890',
            });
            return;
        }
        const profile = await prisma_1.prisma.profile.create({
            data: {
                userId,
                name: name,
                bio: bio || null,
                location: location || null,
                whatsapp: normalizedWhatsapp,
                skills: skills ? JSON.parse(JSON.stringify(skills)) : null,
            },
        });
        res.status(201).json({
            success: true,
            message: 'Profile created successfully',
            data: {
                ...profile,
                skills: profile.skills,
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors,
            });
            return;
        }
        console.error('Create profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to create profile' });
    }
};
exports.createProfile = createProfile;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const data = schemas_1.updateProfileSchema.parse(req.body);
        // Check if profile exists
        const existingProfile = await prisma_1.prisma.profile.findUnique({
            where: { userId },
        });
        if (!existingProfile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        const normalizedWhatsapp = data.whatsapp ? normalizeWhatsapp(data.whatsapp) : undefined;
        if (normalizedWhatsapp && !isValidWhatsapp(normalizedWhatsapp)) {
            res.status(400).json({
                success: false,
                message: 'Invalid WhatsApp number format',
            });
            return;
        }
        const updatedProfile = await prisma_1.prisma.profile.update({
            where: { userId },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.bio !== undefined && { bio: data.bio }),
                ...(data.location !== undefined && { location: data.location }),
                ...(normalizedWhatsapp !== undefined && { whatsapp: normalizedWhatsapp }),
                ...(data.skills && { skills: JSON.parse(JSON.stringify(data.skills)) }),
            },
        });
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                ...updatedProfile,
                skills: updatedProfile.skills,
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors,
            });
            return;
        }
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
};
exports.updateProfile = updateProfile;
const getMyProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const profile = await prisma_1.prisma.profile.findUnique({
            where: { userId },
        });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                ...profile,
                skills: profile.skills,
            },
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
};
exports.getMyProfile = getMyProfile;
const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const profile = await prisma_1.prisma.profile.findUnique({
            where: { userId: parseInt(userId) },
            include: {
                user: {
                    select: {
                        email: true,
                        role: true,
                    },
                },
            },
        });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Profile not found' });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                ...profile,
                skills: profile.skills,
            },
        });
    }
    catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
};
exports.getUserProfile = getUserProfile;
