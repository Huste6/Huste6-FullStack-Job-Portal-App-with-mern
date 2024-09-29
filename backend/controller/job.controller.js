import {
    Job
} from "../models/job.model.js";
import {
    User
} from "../models/user.model.js";

//admin
//[POST] /api/v1/job/post
export const postJob = async (req, res) => {
    try {
        const {
            title,
            description,
            requirements,
            salary,
            location,
            jobType,
            experience,
            position,
            companyID
        } = req.body.data;
        const userID = req.id;
        if (!title || !description || !salary || !requirements || !location || !jobType || !experience || !position || !companyID) {
            return res.status(400).json({
                message: "Something is missing!",
                success: false
            })
        }
        //check role user id is recruiter ? 
        const user = await User.findOne({
            _id: userID
        });
        if (!user) {
            return res.status(400).json({
                message: "User not found!",
                success: false
            })
        } else {
            if (user.role === "student") {
                return res.status(400).json({
                    message: "You don't have permission",
                    success: false
                })
            }
        }
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","),
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: experience,
            position,
            company: companyID,
            created_by: userID
        })
        return res.status(201).json({
            message: "New Job created successfully!",
            success: true,
            job
        })
    } catch (error) {
        console.log(error);
    }
}

//student
//[GET] /api/v1/job/get?Key=...&Value=...
export const getAllJobs = async (req, res) => {
    try {
        const key = req.query.Key || 'title';
        const value = req.query.Value || '';
        const query = {
            [key]: {
                $regex: value,
                $options: "i"
            }
        }
        const jobs = await Job.find(query)
            .populate({
                path: "company",
            })
            .populate({
                path: "applications",
                populate: [{
                    path: "applicant",
                    select: "fullName"
                }]
            })
            .sort({
                createdAt: -1
            });
        if (!jobs) {
            return res.status(404).json({
                message: "Job not found!",
                success: false
            })
        }
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

//student
//[GET] /api/v1/job/get/:id
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate(
            [{
                    path: 'applications',
                    select: "applicant"
                },
                {
                    path: 'company',
                    select: "name"
                }
            ]
        );
        if (!job) {
            return res.status(404).json({
                message: "Jobs not found!",
                success: false
            })
        }
        return res.status(200).json({
            job,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

//admin
//[GET] /api/v1/job/getAdmin/:id
export const getJobByIdAdmin = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.id;
        const job = await Job.findOne({
            _id: jobId,
            created_by: userId
        }).populate(
            [{
                    path: 'applications',
                    select: "applicant"
                },
                {
                    path: 'company',
                    select: "name"
                }
            ]
        );
        if (!job) {
            return res.status(404).json({
                message: "Jobs not found!",
                success: false
            })
        }
        return res.status(200).json({
            job,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

//admin
//[GET] /api/v1/job/getAdminJob
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({
            created_by: adminId
        }).populate({
            path: 'company',
            select: 'name logo'
        });
        if (!jobs) {
            return res.status(404).json({
                message: "Job not found!",
                success: false
            })
        }
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

//admin 
//[PATCH] /api/v1/job/updateJob/:id
export const EditJob = async (req, res) => {
    try {
        const {
            companyID,
            description,
            experienceLevel,
            jobType,
            location,
            position,
            requirements,
            salary,
            title
        } = req.body;
        const jobId = req.params.id;
        const job = await Job.findOne({
            _id: jobId
        });
        if (!job) {
            return res.status(404).json({
                message: "Job not found!",
                success: false
            })
        }
        const updateData = {
            companyID: companyID ? companyID : job?.companyID,
            description: description ? description : job?.description,
            experienceLevel: experienceLevel ? experienceLevel : job?.experienceLevel,
            jobType: jobType ? jobType : job?.jobType,
            location: location ? location : job?.location,
            position: position ? position : job?.position,
            requirements: requirements ? requirements : job?.requirements,
            salary: salary ? salary : job?.salary,
            title: title ? title : job?.title,
        }
        const jobUpdate = await Job.findByIdAndUpdate(jobId, updateData, {
            new: true
        });
        return res.status(200).json({
            message: "Job infomation updated",
            success: true,
            job: jobUpdate
        })
    } catch (error) {
        console.log(error);
    }
}

//admin
//[DELETE] /api/v1/job/deleteJob
export const deleteJob = async (req, res) => {
    try {
        const {
            jobId,
            companyId
        } = req.body;
        const existJob = await Job.findOne({
            _id: jobId,
            company: companyId

        })
        if (!existJob) {
            return res.status(201).json({
                message: 'Not found Job with this company!',
                success: false
            })
        }
        await existJob.deleteOne();
        return res.status(200).json({
            message: 'Delete successfully!',
            success: true
        })
    } catch (error) {
        console.error('Error deleting saved job:', error);
        return res.status(500).json({
            message: 'An error occurred while deleting the saved job.',
            success: false
        });
    }
}