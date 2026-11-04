(function () {
    "use strict";

    const DEFAULT_IMG = "images/selfie.jpg";

    const form = document.getElementById("form");
    const formView = document.getElementById("formView");
    const resultView = document.getElementById("resultView");
    const outputs = document.getElementById("outputs");
    const coursesBox = document.getElementById("courses");
    const pictureInput = document.getElementById("picture");

    const defaultCoursesHTML = coursesBox.innerHTML;

    let uploadedDataUrl = null;
    let uploadedName = null;

    let originalFooterNav = null;

    function escapeHTML(s) {
        return String(s)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function escapeAttr(s) {
        return escapeHTML(s).replace(/"/g, "&quot;");
    }

    function escapeXML(s) {
        return escapeAttr(s).replace(/'/g, "&apos;");
    }

    function field(name) {
        return form.elements[name].value.trim();
    }

    function getData() {
        const courses = Array.from(coursesBox.querySelectorAll(".course-row")).map((row) => ({
            department: row.querySelector("[name='department']").value.trim(),
            courseNumber: row.querySelector("[name='courseNumber']").value.trim(),
            courseTitle: row.querySelector("[name='courseTitle']").value.trim(),
            reasonForTaking: row.querySelector("[name='reasonForTaking']").value.trim()
        }));

        const footerLinks = Array.from(form.querySelectorAll(".link-row")).map((row) => ({
            label: row.querySelector("[name='linkLabel']").value.trim(),
            url: row.querySelector("[name='linkUrl']").value.trim()
        }));

        return {
            firstName: field("firstName"),
            middleName: field("middleName"),
            nickname: field("nickname"),
            lastName: field("lastName"),
            acknowledgment: field("acknowledgment"),
            acknowledgmentDate: field("acknowledgmentDate"),
            prettyNameDivider: field("prettyNameDivider"),
            adjectives: field("adjectives"),
            animal: field("animal"),
            img: uploadedDataUrl || DEFAULT_IMG,
            imgPath: uploadedName ? "images/" + uploadedName : DEFAULT_IMG,
            pictureAlt: field("pictureAlt"),
            caption: field("caption"),
            personalInfo: {
                statement: field("statement"),
                personalBackground: field("personalBackground"),
                professionalBackground: field("professionalBackground"),
                academicBackground: field("academicBackground"),
                primaryWorkComputer: field("primaryWorkComputer"),
                primaryWorkLocation: field("primaryWorkLocation"),
                alternateComputerLocation: field("alternateComputerLocation")
            },
            courses: courses,
            quote: field("quote"),
            quoteAuthor: field("quoteAuthor"),
            funnyItem: field("funnyItem"),
            somethingToShare: field("somethingToShare"),
            footerLinks: footerLinks
        };
    }

    function validateForm() {
        form.querySelectorAll("[required]").forEach((el) => {
            el.setCustomValidity(el.value.trim() === "" ? "Please fill out this field." : "");
        });
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }
        return true;
    }

    function buildHTML(d) {
        const p = d.personalInfo;

        const fullName =
            d.firstName +
            (d.middleName ? " " + d.middleName : "") +
            (d.nickname ? ' "' + d.nickname + '"' : "") +
            " " + d.lastName;
        const heading = fullName + " " + d.prettyNameDivider + " " + d.adjectives + " " + d.animal;

        const bullets = [
            ["Personal Background", p.personalBackground],
            ["Professional Background", p.professionalBackground],
            ["Academic Background", p.academicBackground],
            ["Primary Work Computer", p.primaryWorkComputer],
            ["Primary Work Location", p.primaryWorkLocation],
            ["Alternate Computer Location", p.alternateComputerLocation]
        ];

        const lines = [];
        lines.push("<h6>" + escapeHTML(heading) + "</h6>");
        lines.push("");
        lines.push("<figure>");
        lines.push('    <img src="' + escapeAttr(d.img) + '" alt="' + escapeAttr(d.pictureAlt) + '">');
        lines.push("    <figcaption>" + escapeHTML(d.caption) + "</figcaption>");
        lines.push("</figure>");
        lines.push("");
        lines.push("<p>" + escapeHTML(p.statement) + "</p>");
        lines.push("");
        lines.push("<ul>");
        bullets.forEach(([label, text]) => {
            lines.push("    <li><strong>" + label + ":</strong> " + escapeHTML(text) + "</li>");
        });
        if (d.courses.length) {
            lines.push("    <li><strong>Courses I'm Taking &amp; Why:</strong>");
            lines.push("        <ol>");
            d.courses.forEach((c) => {
                lines.push(
                    "            <li><strong>" +
                    escapeHTML(c.department + " " + c.courseNumber + " - " + c.courseTitle) +
                    ":</strong> " + escapeHTML(c.reasonForTaking) + "</li>"
                );
            });
            lines.push("        </ol>");
            lines.push("    </li>");
        }
        if (d.funnyItem) {
            lines.push("    <li><strong>Funny Thing:</strong> " + escapeHTML(d.funnyItem) + "</li>");
        }
        if (d.somethingToShare) {
            lines.push("    <li><strong>Something I Would Like to Share:</strong> " + escapeHTML(d.somethingToShare) + "</li>");
        }
        lines.push("</ul>");
        lines.push("");
        lines.push("<blockquote>");
        lines.push("    <p>" + escapeHTML(d.quote) + "</p>");
        lines.push("    <p>- " + escapeHTML(d.quoteAuthor) + "</p>");
        lines.push("</blockquote>");
        return lines.join("\n");
    }

    function footerNav() {
        return document.querySelector("footer nav");
    }

    function setFooterLinks(links) {
        const nav = footerNav();
        if (!nav) return;
        if (originalFooterNav === null) originalFooterNav = nav.innerHTML;
        nav.innerHTML = links
            .map((l) => '<a href="' + escapeAttr(l.url) + '">' + escapeHTML(l.label) + "</a>")
            .join(" | ");
    }

    function showIntroduction(d) {
        resultView.innerHTML =
            buildHTML(d) +
            '\n<p><a href="#" id="resetLink">Reset the form and start over</a></p>';
        setFooterLinks(d.footerLinks);
        formView.hidden = true;
        resultView.hidden = false;
        window.scrollTo(0, 0);
    }

    function restoreCourses() {
        coursesBox.innerHTML = defaultCoursesHTML;
    }

    function clearOutputs() {
        outputs.innerHTML = "";
    }

    function resetProgress() {
        uploadedDataUrl = null;
        uploadedName = null;
        restoreCourses();
        clearOutputs();
    }

    form.addEventListener("reset", resetProgress);

    resultView.addEventListener("click", (e) => {
        if (e.target.id !== "resetLink") return;
        e.preventDefault();
        form.reset();
        const nav = footerNav();
        if (nav && originalFooterNav !== null) nav.innerHTML = originalFooterNav;
        resultView.hidden = true;
        resultView.innerHTML = "";
        formView.hidden = false;
        window.scrollTo(0, 0);
    });

    document.getElementById("clearForm").addEventListener("click", () => {
        form.querySelectorAll("input, textarea").forEach((el) => {
            el.value = "";
            el.setCustomValidity("");
        });
        uploadedDataUrl = null;
        uploadedName = null;
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        showIntroduction(getData());
    });

    pictureInput.addEventListener("change", () => {
        const file = pictureInput.files[0];
        if (!file) {
            uploadedDataUrl = null;
            uploadedName = null;
            return;
        }
        if (!file.type.startsWith("image/")) {
            alert("Please choose an image file.");
            pictureInput.value = "";
            uploadedDataUrl = null;
            uploadedName = null;
            return;
        }
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            uploadedDataUrl = reader.result;
            uploadedName = file.name;
        });
        reader.readAsDataURL(file);
    });

    function courseRowHTML() {
        return (
            '<div class="course-row">' +
            '<input type="text" name="department" value="" placeholder="Department (e.g. ITSC)" aria-label="Department" required>' +
            '<input type="text" name="courseNumber" value="" placeholder="Number (e.g. 2600)" aria-label="Course number" required>' +
            '<input type="text" name="courseTitle" value="" placeholder="Course name" aria-label="Course name" required>' +
            '<input type="text" name="reasonForTaking" value="" placeholder="Why are you taking it?" aria-label="Reason for taking the course" required>' +
            '<button type="button" class="delete-course">Delete</button>' +
            "</div>"
        );
    }

    document.getElementById("addCourse").addEventListener("click", () => {
        coursesBox.insertAdjacentHTML("beforeend", courseRowHTML());
        const rows = coursesBox.querySelectorAll(".course-row");
        rows[rows.length - 1].querySelector("input").focus();
    });

    coursesBox.addEventListener("click", (e) => {
        const btn = e.target.closest(".delete-course");
        if (btn) btn.closest(".course-row").remove();
    });

    function showOutput(id, title, text) {
        let area = document.getElementById(id);
        if (!area) {
            const section = document.createElement("section");
            section.className = "output";
            const h3 = document.createElement("h3");
            h3.textContent = title;
            area = document.createElement("textarea");
            area.id = id;
            area.readOnly = true;
            area.rows = 20;
            area.setAttribute("aria-label", title);
            section.append(h3, area);
            outputs.appendChild(section);
        }
        area.value = text;
        area.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function toJSON(d) {
        const out = Object.assign({}, d, { img: d.imgPath });
        delete out.imgPath;
        return JSON.stringify(out, null, 2);
    }

    function toXML(d) {
        const p = d.personalInfo;
        const tag = (name, value, pad) => pad + "<" + name + ">" + escapeXML(value) + "</" + name + ">";
        const x = [];
        x.push('<?xml version="1.0" encoding="UTF-8"?>');
        x.push("<introduction>");
        ["firstName", "middleName", "nickname", "lastName", "acknowledgment", "acknowledgmentDate", "prettyNameDivider", "adjectives", "animal"]
            .forEach((k) => x.push(tag(k, d[k], "  ")));
        x.push(tag("img", d.imgPath, "  "));
        x.push(tag("pictureAlt", d.pictureAlt, "  "));
        x.push(tag("caption", d.caption, "  "));
        x.push("  <personalInfo>");
        Object.keys(p).forEach((k) => x.push(tag(k, p[k], "    ")));
        x.push("  </personalInfo>");
        x.push("  <courses>");
        d.courses.forEach((c) => {
            x.push("    <course>");
            Object.keys(c).forEach((k) => x.push(tag(k, c[k], "      ")));
            x.push("    </course>");
        });
        x.push("  </courses>");
        x.push(tag("quote", d.quote, "  "));
        x.push(tag("quoteAuthor", d.quoteAuthor, "  "));
        x.push(tag("funnyItem", d.funnyItem, "  "));
        x.push(tag("somethingToShare", d.somethingToShare, "  "));
        x.push("  <footerLinks>");
        d.footerLinks.forEach((l) => {
            x.push("    <link>");
            x.push(tag("label", l.label, "      "));
            x.push(tag("url", l.url, "      "));
            x.push("    </link>");
        });
        x.push("  </footerLinks>");
        x.push("</introduction>");
        return x.join("\n");
    }

    document.getElementById("genHtml").addEventListener("click", () => {
        const d = getData();
        d.img = d.imgPath;
        const body = buildHTML(d).split("\n").map((l) => (l ? "    " + l : l)).join("\n");
        showOutput("outHtml", "Generated HTML", "<main>\n    <h2>Introduction Form</h2>\n" + body + "\n</main>");
    });

    document.getElementById("genJson").addEventListener("click", () => {
        showOutput("outJson", "Generated JSON", toJSON(getData()));
    });

    document.getElementById("genXml").addEventListener("click", () => {
        showOutput("outXml", "Generated XML", toXML(getData()));
    });
})();